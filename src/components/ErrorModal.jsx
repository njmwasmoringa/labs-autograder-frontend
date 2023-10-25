import Modal from 'react-bootstrap';

export default function ErrorModal({title, status, message}){
    return (<Modal.Dialog>
        {title && <Modal.Header>
            <Modal.Title>{title}</Modal.Title>    
        </Modal.Header>}
        <Modal.Body>
            {message}
        </Modal.Body>
    </Modal.Dialog>)
}