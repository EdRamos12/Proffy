import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', '..', 'uploads'),
        filename: (r, file, callback) => {
            const hash = crypto.randomBytes(8).toString('hex');
            const filename = `${hash}-${file.originalname}`;

            callback(null, filename);
        }
    }),
    limits: {
        fileSize: 5 * 1000 * 1000,
    },
    fileFilter: function(rq: any, file: any, cb: any){
        const fileTypes = /jpeg|jpg|png|gif|jfif/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        }

        cb('Error: Images only!');
    }
}