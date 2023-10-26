import { createContext, useState } from "react";
import { Modal } from "react-bootstrap";

export const ModalContext = createContext();
export default function ModalProvider({ children }) {

    const [modalData, setModalData] = useState();

    return (<>
        {modalData && <Modal show={true} centered onHide={()=>{
            if(modalData.onHide) modalData.onHide();
            else setModalData(undefined);
        }} fullscreen={modalData.fullScreen === true ? true : "md-down"}>
            {modalData.title && <Modal.Header closeButton>
                <Modal.Title>{modalData.title}</Modal.Title>
            </Modal.Header>}
            <Modal.Body>{modalData.body}</Modal.Body>
            {modalData.footer}
        </Modal>}
        
        <ModalContext.Provider value={[modalData, setModalData]}>{children}</ModalContext.Provider>
        
    </>);
}