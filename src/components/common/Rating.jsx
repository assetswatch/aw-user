import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";

const Rating = ({ length, ratingVal = 0 }) => {
  {
    let arrRatingNum = [];
    length = checkEmptyVal(length) ? 5 : length;
    for (let i = 1; i < length + 1; i++) {
      arrRatingNum.push(i);
    }

    return arrRatingNum.map((i) => {
      return ratingVal == "0" ? (
        <i className={`fa-regular fa-star`} key={`ar-key-${i}`}></i>
      ) : (
        <i
          className={`${
            i <= ratingVal.toString().substring(0, 1)
              ? "fa-solid fa-star"
              : "fa-regular fa-star"
          }`}
          key={`ar-key-${i}`}
        ></i>
      );
    });
  }
};

export default Rating;
