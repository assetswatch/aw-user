import { Modal, Button } from "react-bootstrap";
import { checkEmptyVal } from "../../utils/common";
const FilesUploadProgressView = ({ title, content, onClose, actions }) => {
  return (
    <>
      <Modal show={true} centered animation={true} backdrop="static">
        <Modal.Header className="box-shadow">
          <Modal.Title className="">
            {title ? title : "Upload files"}
          </Modal.Title>

          {!checkEmptyVal(onClose) && (
            <button
              type="button"
              className="btn btn-glow px-10 d-flex flex-center"
              aria-label="Close"
              onClick={onClose}
            >
              <i className="fa fa-times-circle font-large text-primary box-shadow lh-1 rounded-circle text-white"></i>
            </button>
          )}
        </Modal.Header>
        <Modal.Body>{content}</Modal.Body>

        {actions?.length > 0 && (
          <Modal.Footer className="modal-action">
            {actions
              ?.sort((a, b) => b.displayOrder - a.displayOrder)
              ?.map((a, i) => {
                return (
                  <Button
                    className={`btn ${
                      a.btnClass ? a.btnClass : "btn-primary"
                    }  btn-glow shadow`}
                    onClick={a.onClick}
                    key={`mfbtn-${i}`}
                    id={a.id}
                  >
                    {a.text}
                  </Button>
                );
              })}
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default FilesUploadProgressView;
