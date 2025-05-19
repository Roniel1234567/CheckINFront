import axios from 'axios';

export const uploadDocsEstudiante = async (documento: string, files: {
  id_doc_file?: File;
  cv_doc_file?: File;
  anexo_iv_doc_file?: File;
  anexo_v_doc_file?: File;
  acta_nac_doc_file?: File;
  ced_padres_doc_file?: File;
  vac_covid_doc_file?: File;
}) => {
  const data = new FormData();
  if (files.id_doc_file) data.append('id_doc_file', files.id_doc_file);
  if (files.cv_doc_file) data.append('cv_doc_file', files.cv_doc_file);
  if (files.anexo_iv_doc_file) data.append('anexo_iv_doc_file', files.anexo_iv_doc_file);
  if (files.anexo_v_doc_file) data.append('anexo_v_doc_file', files.anexo_v_doc_file);
  if (files.acta_nac_doc_file) data.append('acta_nac_doc_file', files.acta_nac_doc_file);
  if (files.ced_padres_doc_file) data.append('ced_padres_doc_file', files.ced_padres_doc_file);
  if (files.vac_covid_doc_file) data.append('vac_covid_doc_file', files.vac_covid_doc_file);

  const response = await axios.put(`${import.meta.env.VITE_API_URL}/docs-estudiante/${documento}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

// Descargar o ver archivo de un estudiante
export const downloadDocEstudiante = async (documento: string, tipo: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/docs-estudiante/${documento}/archivo/${tipo}`, {
    responseType: 'blob'
  });
  return response.data; // Blob
};

export const getDocsEstudiante = async (documento: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/docs-estudiante/${documento}`);
  return response.data;
};

export const getDocsEstudianteByDocumento = async (documento: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/docs-estudiante/estudiante/${documento}`);
  return response.data;
}; 