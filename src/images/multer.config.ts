// je konfiguracioni fajl koji se koristi za podešavanje opcija za Multer, popularni middleware za upload fajlova u Node.js aplikacijama.
//  Multer omogućava rukovanje multipart/form-data zahteva, koji se obično koriste za upload fajlova (kao što su slike, PDF-ovi, itd.)
import * as multer from 'multer';
import path from 'path';

//Definisanje gde ce se fajlovi skladistiti
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    //Definisemo ime fajla prilikom upload-a
    const fileExtension = path.extname(file.originalname);
    const fileName = Date.now() + fileExtension;
    cb(null, fileName);
  },
});

//Definisanje ogranicenja i tipova fajla
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeType = ['image/jpeg', 'image/png', 'image/gif'];

  //ako je tip fajla dozvoljen pozivamo cb sa true, u suprotnom false
  if (allowedMimeType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file. File must be jpeg, png or gif'), false);
  }
};
//Definiramo maksimalne velicine fajla
const limits = {
  fileSize: 10 * 1024 * 1024, //maksimalna velicina fajla 10MB
};
//Kreiranje multer middleware-a sa gore definisanim opcijama
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

export default upload;
