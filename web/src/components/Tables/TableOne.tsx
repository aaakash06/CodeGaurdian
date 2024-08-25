import { BRAND } from "@/types/brand";
import Image from "next/image";
import Link from "next/link";

const brandData = [
  {
    name: "CV-AK",
    commits: 15,
    issues: "5",
    contributors: 1,
    link:"https://github.com/aaakash06/CV-AK"
    // conversion: 4.8,
  },
  // {
  //   name: "Pantry Tracker",
  //   visitors: 22,
  //   revenues: "4",
  //   sales: 1,
  //   // conversion: 4.3,
  // },
  // {
  //   name: "AI-Customer",
  //   visitors: 21,
  //   revenues: "2",
  //   sales: 4,
  //   // conversion: 3.7,
  // },
  // {
  //   name: "AI-FlashCard",
  //   visitors: 15,
  //   revenues: "3",
  //   sales: 4,
  //   // conversion: 2.5,
  // },
  // {
  //   name: "Code Guardian",
  //   visitors: 12,
  //   revenues: "1",
  //   sales: 4,
  //   // conversion: 1.9,
  // },
];

const TableOne = () => {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Top Repositories
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 sm:grid-cols-4">
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Source
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Commits
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Issues
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Contributors
            </h5>
          </div>
          {/* <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Conversion
            </h5>
          </div> */}
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-4 ${
              key === brandData.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3.5 px-2 py-4">
              <Link href={"https://github.com/aaakash06/CV-AK"} target="_blank">
                <p className="hidden font-medium text-dark dark:text-white sm:block cursor-pointer" >
                  {brand.name}
                </p>
              </Link>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.commits}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-red">
                {brand.issues}
              </p>
            </div>

            <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <p className="font-medium text-dark dark:text-white">
                {brand.contributors}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
