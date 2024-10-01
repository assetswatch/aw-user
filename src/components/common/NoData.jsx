import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";
import { AppMessages } from "../../utils/constants";

export default function NoData(noDataProps) {
  let position = noDataProps?.pos?.toLowerCase();
  return (
    <div
      className={`no-data flex ${
        position == "left"
          ? "flex-start"
          : position == "right"
          ? "flex-end"
          : "flex-center"
      } ${noDataProps?.className}`}
    >
      {checkEmptyVal(noDataProps?.message) ||
      checkObjNullorEmpty(noDataProps?.message)
        ? AppMessages.NoData
        : noDataProps?.message}
    </div>
  );
}
