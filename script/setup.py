import os
import sys
import git
import psycopg2
from psycopg2 import sql
from collections import Counter
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment variables from .env file
load_dotenv()

# Get the PostgreSQL connection string from the environment variable
POSTGRES_CONNECTION = os.getenv('POSTGRES_CONNECTION')

# Function to create necessary tables in the database
def create_tables():
    try:
        connection = psycopg2.connect(POSTGRES_CONNECTION)
        cursor = connection.cursor()
        
        # Create commits table with repository name
        create_commits_table = '''
        CREATE TABLE IF NOT EXISTS commits (
            id SERIAL PRIMARY KEY,
            repository_name VARCHAR(255),
            commit_hash VARCHAR(40),
            author VARCHAR(255),
            date TIMESTAMP,
            message TEXT
        );
        '''
        
        # Create repo_stats table with repository name
        create_repo_stats_table = '''
        CREATE TABLE IF NOT EXISTS repo_stats (
            id SERIAL PRIMARY KEY,
            repository_name VARCHAR(255),
            contributor VARCHAR(255),
            commit_count INTEGER
        );
        '''
        
        # Create total_commits table with repository name
        create_total_commits_table = '''
        CREATE TABLE IF NOT EXISTS total_commits (
            id SERIAL PRIMARY KEY,
            repository_name VARCHAR(255),
            total INTEGER
        );
        '''
        
        # Execute table creation queries
        cursor.execute(create_commits_table)
        cursor.execute(create_repo_stats_table)
        cursor.execute(create_total_commits_table)
        
        connection.commit()
        cursor.close()
        connection.close()
        print("Tables created successfully.")
    
    except Exception as error:
        print(f"Error creating tables: {error}")

# Function to clone or pull the repository
def clone_or_pull_repo(repo_url, repo_path):
    if os.path.exists(repo_path):
        repo = git.Repo(repo_path)
        repo.remote().pull()
        print(f"Updated repository at {repo_path}")
    else:
        git.Repo.clone_from(repo_url, repo_path)
        print(f"Cloned repository to {repo_path}")

# Function to fetch the latest commit hash from the database for a specific repository
def get_latest_commit_hash(repository_name):
    try:
        connection = psycopg2.connect(POSTGRES_CONNECTION)
        cursor = connection.cursor()
        cursor.execute("SELECT commit_hash FROM commits WHERE repository_name = %s ORDER BY date DESC LIMIT 1", (repository_name,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result[0] if result else None
    except Exception as error:
        print(f"Error fetching latest commit hash: {error}")
        return None

# Function to extract new commits based on the latest commit hash
def extract_new_commits(repo_path, latest_commit_hash):
    repo = git.Repo(repo_path)
    commits = []
    found_latest = False

    for commit in repo.iter_commits():
        if commit.hexsha == latest_commit_hash:
            found_latest = True
            break
        commits.append({
            'hash': commit.hexsha,
            'author': commit.author.name,
            'date': commit.committed_datetime,
            'message': commit.message.strip()
        })
    
    return commits[::-1] if not found_latest else commits

# Function to store commit data in PostgreSQL
def store_commits_in_postgres(commits, repository_name):
    try:
        connection = psycopg2.connect(POSTGRES_CONNECTION)
        cursor = connection.cursor()

        insert_query = sql.SQL(
            "INSERT INTO commits (repository_name, commit_hash, author, date, message) VALUES (%s, %s, %s, %s, %s)"
        )
        
        for commit in commits:
            cursor.execute(insert_query, (
                repository_name, commit['hash'], commit['author'], commit['date'], commit['message']
            ))

        connection.commit()
        cursor.close()
        connection.close()
        print(f"Inserted {len(commits)} new commits into the database for {repository_name}")
    
    except Exception as error:
        print(f"Error inserting commits: {error}")

# Function to get repository statistics (contributors, total commits)
def get_repo_stats(repo_path):
    repo = git.Repo(repo_path)
    
    # Get total number of commits
    total_commits = sum(1 for _ in repo.iter_commits())
    
    # Get contributor commit counts
    commit_counts = Counter()
    for commit in repo.iter_commits():
        commit_counts[commit.author.name] += 1

    return {
        'total_commits': total_commits,
        'contributor_stats': dict(commit_counts)
    }

# Function to store stats in PostgreSQL
def store_stats_in_postgres(stats, repository_name):
    try:
        connection = psycopg2.connect(POSTGRES_CONNECTION)
        cursor = connection.cursor()

        # Store total commits
        cursor.execute("DELETE FROM total_commits WHERE repository_name = %s", (repository_name,))
        cursor.execute("INSERT INTO total_commits (repository_name, total) VALUES (%s, %s)", (repository_name, stats['total_commits']))

        # Store contributor stats
        cursor.execute("DELETE FROM repo_stats WHERE repository_name = %s", (repository_name,))
        for contributor, count in stats['contributor_stats'].items():
            cursor.execute(
                "INSERT INTO repo_stats (repository_name, contributor, commit_count) VALUES (%s, %s, %s)",
                (repository_name, contributor, count)
            )

        connection.commit()
        cursor.close()
        connection.close()
        print(f"Repository stats stored successfully for {repository_name}")
    
    except Exception as error:
        print(f"Error inserting stats: {error}")

# Function to extract repository name from URL
def get_repo_name_from_url(repo_url):
    parsed_url = urlparse(repo_url)
    repo_name = os.path.basename(parsed_url.path).replace('.git', '')
    return repo_name

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <repository_url>")
        sys.exit(1)
    
    # Step 1: Get the repository URL from the command-line arguments
    REPOSITORY_URL = sys.argv[1]

    # Step 2: Extract repository name from the URL
    REPOSITORY_NAME = get_repo_name_from_url(REPOSITORY_URL)
    LOCAL_REPO_PATH = f"./repositories/{REPOSITORY_NAME}"

    # Step 3: Create the necessary tables
    create_tables()
    
    # Step 4: Clone or pull the repository
    clone_or_pull_repo(REPOSITORY_URL, LOCAL_REPO_PATH)

    # Step 5: Fetch the latest commit hash from the database
    latest_commit_hash = get_latest_commit_hash(REPOSITORY_NAME)

    # Step 6: Extract new commits only (if it's the first time, fetch all)
    new_commits = extract_new_commits(LOCAL_REPO_PATH, latest_commit_hash)

    # Step 7: Store new commits in the database
    if new_commits:
        store_commits_in_postgres(new_commits, REPOSITORY_NAME)
    else:
        print(f"No new commits to insert for {REPOSITORY_NAME}.")

    # Step 8: Get repository statistics
    repo_stats = get_repo_stats(LOCAL_REPO_PATH)

    # Step 9: Store repository statistics in PostgreSQL
    store_stats_in_postgres(repo_stats, REPOSITORY_NAME)
