
const API_BASE = "http://localhost:8000";

export const api = {
  // Session
  initSession: async (formType: string) => {
    const formData = new FormData();
    formData.append("form_type", formType);

    // Inject Token if exists
    const token = localStorage.getItem("auth_token");
    if (token) {
      formData.append("token", token);
    }

    const res = await fetch(`${API_BASE}/session/init`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  getSession: async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/session/${sessionId}`);
    return res.json();
  },

  // Upload
  uploadDocument: async (sessionId: string, docType: string, files: File | File[]) => {
    const formData = new FormData();
    formData.append("document_type", docType);

    // Handle both single file and array of files
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(file => {
      formData.append("files", file);
    });

    const res = await fetch(`${API_BASE}/session/${sessionId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return res.json();
  },

  // Voice
  uploadVoice: async (sessionId: string, audioBlob: Blob) => {
    const formData = new FormData();
    const file = new File([audioBlob], "input.wav", { type: "audio/wav" });
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/session/${sessionId}/voice`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  // Finalize
  finalize: async (sessionId: string) => {
    const formData = new FormData();
    // Inject Token if exists
    const token = localStorage.getItem("auth_token");
    if (token) {
      formData.append("token", token);
    }

    const res = await fetch(`${API_BASE}/session/${sessionId}/finalize`, {
      method: "POST",
      body: formData, // Changed from empty POST to FormData
    });
    return res.json();
  },

  // List Forms
  listForms: async () => {
    const res = await fetch(`${API_BASE}/forms/list/`);
    return res.json();
  }
};
