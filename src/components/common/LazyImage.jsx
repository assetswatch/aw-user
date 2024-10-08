import {
  LazyLoadComponent,
  LazyLoadImage,
} from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { checkEmptyVal } from "../../utils/common";

const LazyImage = ({ alt, src, className, placeHolderClass, onClick }) => {
  return (
    <>
      <LazyLoadImage
        alt={checkEmptyVal(alt) ? "" : ""}
        src={src}
        className={className}
        onClick={onClick ? onClick : () => {}}
        placeholder={
          <div
            className={`d-flex flex-center ${
              checkEmptyVal(placeHolderClass) ? "" : placeHolderClass
            }`}
          >
            <div className="imgloader"></div>
          </div>
        }
      />
      {/* <LazyLoadComponent>
        <div
          className={`d-flex flex-center ${
            checkEmptyVal(placeHolderClass) ? "" : placeHolderClass
          }`}
        >
          <div className="imgloader"></div>
        </div>
      </LazyLoadComponent> */}
    </>
  );
};

export default LazyImage;
