import { checkEmptyVal, convertImageToBase64 } from "./common";
import { pdfHFWMSettings, html2PdfSettings } from "./constants";
import html2pdf from "html2pdf.js";

export const generateInvoiceDownloadPDF = async (
  pdfDetails,
  invoiceDetails,
  receiptType
) => {
  const watermarkImage = pdfDetails.BrandingDetails.WatermarkUrl;
  const base64Watermark = checkEmptyVal(watermarkImage)
    ? ""
    : await convertImageToBase64(watermarkImage);

  const pdfFileName = `${
    receiptType +
    "-" +
    invoiceDetails?.AccountId +
    "-" +
    invoiceDetails?.ProfileId +
    "-" +
    invoiceDetails?.InvoiceNumber
  }.pdf`;

  const pdf = await html2pdf()
    .from(pdfDetails.PdfHtml)
    .set(
      { ...html2PdfSettings },
      {
        filename: pdfFileName,
      }
    )
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(
          pdfHFWMSettings.fLineColor.r,
          pdfHFWMSettings.fLineColor.g,
          pdfHFWMSettings.fLineColor.b
        );
        pdf.line(
          pdfHFWMSettings.fLinex1OffSet,
          pageHeight - pdfHFWMSettings.fLiney1OffSet,
          pageWidth - pdfHFWMSettings.fLinex1OffSet,
          pageHeight - pdfHFWMSettings.fLiney1OffSet
        );

        pdf.setFontSize(pdfHFWMSettings.fFontSize);
        pdf.setFont(...pdfHFWMSettings.fFontFamily);
        pdf.setTextColor(
          pdfHFWMSettings.fFontColor.r,
          pdfHFWMSettings.fFontColor.g,
          pdfHFWMSettings.fFontColor.b
        );

        if (
          pdfDetails.BrandingDetails.IsBrandingEnabled == 1 &&
          pdfDetails.BrandingDetails.Id > 0
        ) {
          pdf.text(
            pdfDetails?.BrandingDetails?.Header,
            pageWidth / pdfHFWMSettings.pageHalf,
            pdfHFWMSettings.hTextyOffSet,
            pdfHFWMSettings.fCenter
          );

          pdf.text(
            pdfDetails?.BrandingDetails?.Footer,
            pageWidth / pdfHFWMSettings.pageHalf,
            pageHeight - pdfHFWMSettings.fTextyOffSet,
            pdfHFWMSettings.fCenter
          );
        }

        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - pdfHFWMSettings.fPixOffSet,
          pageHeight - pdfHFWMSettings.fPiyOffSet,
          pdfHFWMSettings.fRight
        );

        if (
          !checkEmptyVal(base64Watermark) &&
          pdfDetails.BrandingDetails.IsBrandingEnabled == 1 &&
          pdfDetails.BrandingDetails.Id > 0
        ) {
          pdf.setGState(new pdf.GState(pdfHFWMSettings.wmOpacity));
          pdf.addImage(
            base64Watermark,
            "PNG",
            (pageWidth - pdfHFWMSettings.wmWidth) / pdfHFWMSettings.pageHalf,
            (pageHeight -
              (pdfHFWMSettings.wmHeight - pdfHFWMSettings.wmyOffSet)) /
              pdfHFWMSettings.pageHalf,
            pdfHFWMSettings.wmWidth,
            pdfHFWMSettings.wmHeight,
            "",
            "FAST"
          );
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        }
      }

      pdf.internal.scaleFactor = pdfHFWMSettings.scaleFactor;
      pdf.save(`${pdfFileName}`);
    });
};

export const generateInvoicePDF = async (
  pdfDetails,
  invoiceDetails,
  receiptType,
  setPdfBlob,
  setFileUrl
) => {
  const watermarkImage = pdfDetails.BrandingDetails.WatermarkUrl;
  const base64Watermark = checkEmptyVal(watermarkImage)
    ? ""
    : await convertImageToBase64(watermarkImage);

  const pdfFileName = `${
    receiptType +
    "-" +
    invoiceDetails?.AccountId +
    "-" +
    invoiceDetails?.ProfileId +
    "-" +
    invoiceDetails?.InvoiceNumber
  }.pdf`;

  const pdf = await html2pdf()
    .from(pdfDetails.PdfHtml)
    .set(
      { ...html2PdfSettings },
      {
        filename: pdfFileName,
      }
    )
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      pdf.setGState(new pdf.GState({ opacity: 1 }));
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(
          pdfHFWMSettings.fLineColor.r,
          pdfHFWMSettings.fLineColor.g,
          pdfHFWMSettings.fLineColor.b
        );
        pdf.line(
          pdfHFWMSettings.fLinex1OffSet,
          pageHeight - pdfHFWMSettings.fLiney1OffSet,
          pageWidth - pdfHFWMSettings.fLinex1OffSet,
          pageHeight - pdfHFWMSettings.fLiney1OffSet
        );

        pdf.setFontSize(pdfHFWMSettings.fFontSize);
        pdf.setFont(...pdfHFWMSettings.fFontFamily);
        pdf.setTextColor(
          pdfHFWMSettings.fFontColor.r,
          pdfHFWMSettings.fFontColor.g,
          pdfHFWMSettings.fFontColor.b
        );

        if (
          pdfDetails.BrandingDetails.IsBrandingEnabled == 1 &&
          pdfDetails.BrandingDetails.Id > 0
        ) {
          pdf.text(
            pdfDetails?.BrandingDetails?.Header,
            pageWidth / pdfHFWMSettings.pageHalf,
            pdfHFWMSettings.hTextyOffSet,
            pdfHFWMSettings.fCenter
          );

          pdf.text(
            pdfDetails?.BrandingDetails?.Footer,
            pageWidth / pdfHFWMSettings.pageHalf,
            pageHeight - pdfHFWMSettings.fTextyOffSet,
            pdfHFWMSettings.fCenter
          );
        }

        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - pdfHFWMSettings.fPixOffSet,
          pageHeight - pdfHFWMSettings.fPiyOffSet,
          pdfHFWMSettings.fRight
        );

        if (
          !checkEmptyVal(base64Watermark) &&
          pdfDetails.BrandingDetails.IsBrandingEnabled == 1 &&
          pdfDetails.BrandingDetails.Id > 0
        ) {
          pdf.setGState(new pdf.GState(pdfHFWMSettings.wmOpacity));
          pdf.addImage(
            base64Watermark,
            "PNG",
            (pageWidth - pdfHFWMSettings.wmWidth) / pdfHFWMSettings.pageHalf,
            (pageHeight -
              (pdfHFWMSettings.wmHeight - pdfHFWMSettings.wmyOffSet)) /
              pdfHFWMSettings.pageHalf,
            pdfHFWMSettings.wmWidth,
            pdfHFWMSettings.wmHeight,
            "",
            "FAST"
          );
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        }
      }

      pdf.internal.scaleFactor = pdfHFWMSettings.scaleFactor;
    })
    .outputPdf("blob")
    .then((pdf) => {
      setPdfBlob(pdf);
      const pdfBlobUrl = URL.createObjectURL(pdf);
      setFileUrl(pdfBlobUrl);
    });
};
