import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { themePlugin } from "@react-pdf-viewer/theme";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";

const PdfViewer = ({ file, cssclass, showThumbnail = true }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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
          plugins={[defaultLayoutPluginInstance, thumbnailPluginInstance]}
          defaultScale={SpecialZoomLevel.PageWidth}
          onDocumentLoad={handleDocumentLoad}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;
