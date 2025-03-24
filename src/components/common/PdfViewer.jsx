import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { themePlugin } from "@react-pdf-viewer/theme";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import config from "../../config.json";

const PdfViewer = ({
  file,
  cssclass,
  showThumbnail = false,
  pageWidth = config.pdfViewerWidth.PageWidth,
}) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const fullScreenPluginInstance = fullScreenPlugin();

  const thumbnailPluginInstance = thumbnailPlugin({
    renderSpinner: () => <div className="square-spinner" />,
    thumbnailWidth: 150,
  });

  const handleDocumentLoad = (DocumentLoadEvent) => {
    if (showThumbnail) {
      const { activateTab } = defaultLayoutPluginInstance;
      // Activate the bookmark tab
      activateTab(0);
    }
  };

  return (
    <div
      className={`${cssclass} rounded box-shadow pb-20 pdf-viewer-container`}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={file}
          plugins={[
            defaultLayoutPluginInstance,
            thumbnailPluginInstance,
            fullScreenPluginInstance,
          ]}
          defaultScale={
            pageWidth === config.pdfViewerWidth.PageWidth
              ? SpecialZoomLevel.PageWidth
              : (pageWidth = config.pdfViewerWidth.Actual
                  ? SpecialZoomLevel.ActualSize
                  : (pageWidth = config.pdfViewerWidth.PageFit
                      ? SpecialZoomLevel.PageFit
                      : SpecialZoomLevel.PageWidth))
          }
          onDocumentLoad={handleDocumentLoad}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;
