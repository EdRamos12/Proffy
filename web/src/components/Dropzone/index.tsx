import React, {useCallback, useState, useContext} from 'react';
import {useDropzone} from 'react-dropzone';
import './styles.css';
import AuthContext from '../../contexts/AuthContext';
import cameraIcon from '../../assets/images/icons/camera.svg';

interface Props {
    onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUpload }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    const { user } = useContext(AuthContext);

    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles[0]);
        if (acceptedFiles[0] === undefined) return;
        if (acceptedFiles[0].size > 5 * 1000 * 1000) {
            alert('File too large! (higher than 5 Mb)');
            return;
        }
        if (!/jpeg|jpg|png|gif|jfif/.test(acceptedFiles[0].type)) {
            alert('Invalid image type');
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