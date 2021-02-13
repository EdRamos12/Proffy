import React, {useCallback, useState, useContext} from 'react';
import {useDropzone} from 'react-dropzone';
import './styles.css';
import AuthContext from '../../contexts/AuthContext';
import cameraIcon from '../../assets/images/icons/camera.svg';
import NotificationContext from '../../contexts/NotificationContext';
import { v4 } from 'uuid';

interface Props {
    onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUpload }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    const { user } = useContext(AuthContext);
    const dispatch = useContext(NotificationContext);

    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles[0]);
        if (acceptedFiles[0] === undefined) return;
        if (acceptedFiles[0].size > 5 * 1000 * 1000) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    type: 'ERROR',
                    message: 'The image you tried to upload is too large (higher than 5mb)!',
                    title: 'File size too large.',
                    id: v4(),
                }
            });
            return;
        }
        if (!/jpeg|jpg|png|jfif/.test(acceptedFiles[0].type)) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    type: 'ERROR',
                    message: 'Try uploading the image as: .jpeg, .jpg, .png or .jfif',
                    title: 'Invalid image type.',
                    id: v4(),
                }
            });
            return;
        }
        
        const file = acceptedFiles[0];
        setSelectedFileUrl(URL.createObjectURL(file));
        onFileUpload(file);
    }, [onFileUpload]);
    
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/jfif']});

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept=".jpeg,.jpg,.png,.gif,.jfif"/>
            {
                selectedFileUrl ?
                (
                    <> 
                        <img id="avatar" src={selectedFileUrl} alt="Avatar" />
                        <h1>
                            {
                                isDragActive ?
                                "+" :
                                ""
                            }
                        </h1>
                        <span id="camera">
                            <img src={cameraIcon} alt="Edit" />
                        </span>
                    </>  
                ) :
                (   
                    <>
                        <h1 style={{marginTop: "6.5rem"}}>
                            {
                                isDragActive ?
                                "+" :
                                ""
                            }
                        </h1>
                        
                        <img id="avatar" src={user?.avatar} alt="Avatar" />
                        <span id="camera">
                            <img src={cameraIcon} alt="Edit" />
                        </span>
                    </>
                )
            }
        </div>
    )
}

export default Dropzone;