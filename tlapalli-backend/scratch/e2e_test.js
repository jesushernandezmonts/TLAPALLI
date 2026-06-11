const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const api = axios.create({ baseURL: 'http://localhost:3000' });

async function main() {
  try {
    // 1. Create instructor
    console.log('Creating instructor...');
    const createRes = await api.post('/instructores', {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
    });
    const instructor = createRes.data;
    console.log('Instructor created:', instructor.id);

    // Paths to dummy files
    const cvPath = path.resolve('c:/Users/uzuma/Desktop/proyecto_estadias/tlapalli-backend/tmp/dummy_cv.pdf');
    const temarioPath = path.resolve('c:/Users/uzuma/Desktop/proyecto_estadias/tlapalli-backend/tmp/dummy_temario.pdf');

    // 2. Upload CV
    console.log('Uploading CV...');
    const cvForm = new FormData();
    cvForm.append('cv', fs.createReadStream(cvPath));
    const cvRes = await api.post(`/instructores/${instructor.id}/upload-cv`, cvForm, {
      headers: cvForm.getHeaders(),
    });
    console.log('CV uploaded, response:', cvRes.data);

    // 3. Upload Temario
    console.log('Uploading Temario...');
    const temarioForm = new FormData();
    temarioForm.append('temario', fs.createReadStream(temarioPath));
    const temarioRes = await api.post(`/instructores/${instructor.id}/upload-temario`, temarioForm, {
      headers: temarioForm.getHeaders(),
    });
    console.log('Temario uploaded, response:', temarioRes.data);

    // 4. Verify that files exist in uploads folder
    const uploadsDir = path.resolve('c:/Users/uzuma/Desktop/proyecto_estadias/tlapalli-backend/uploads/instructores');
    const cvFiles = fs.readdirSync(path.join(uploadsDir, 'cv'));
    const temarioFiles = fs.readdirSync(path.join(uploadsDir, 'temario'));
    console.log('CV files on disk:', cvFiles);
    console.log('Temario files on disk:', temarioFiles);

    // 5. Delete CV via API
    console.log('Deleting CV...');
    await api.delete(`/instructores/${instructor.id}/cv`);
    console.log('CV deleted');

    // 6. Delete Temario via API
    console.log('Deleting Temario...');
    await api.delete(`/instructores/${instructor.id}/temario`);
    console.log('Temario deleted');

    // 7. Verify files removed
    const cvFilesAfter = fs.readdirSync(path.join(uploadsDir, 'cv'));
    const temarioFilesAfter = fs.readdirSync(path.join(uploadsDir, 'temario'));
    console.log('CV files after deletion:', cvFilesAfter);
    console.log('Temario files after deletion:', temarioFilesAfter);

    // 8. Delete instructor (cleanup)
    console.log('Deleting instructor...');
    await api.delete(`/instructores/${instructor.id}`);
    console.log('Instructor deleted');

    console.log('E2E test completed successfully');
  } catch (err) {
    console.error('Error during E2E test:', err.response ? err.response.data : err.message);
  }
}

main();
