import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  File, 
  Loader2, 
  AlertCircle,
  Search,
  Plus
} from 'lucide-react';
import { FileMetadata } from '../types';

const Files: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'files'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FileMetadata[];
      setFiles(fileList);
      setLoading(false);
    }, (err) => {
      console.error('Firestore Error:', err);
      setError('Failed to load files. Please check your permissions.');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    setUploading(true);
    setError('');

    for (const file of acceptedFiles) {
      try {
        const fileRef = ref(storage, `files/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await addDoc(collection(db, 'files'), {
          name: file.name,
          url,
          type: file.type,
          size: file.size,
          ownerId: user.uid,
          createdAt: Timestamp.now()
        });
      } catch (err: any) {
        console.error('Upload Error:', err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    setUploading(false);
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  } as any);

  const handleDelete = async (file: FileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      // Delete from storage
      const fileRef = ref(storage, file.url);
      await deleteObject(fileRef);
      
      // Delete from firestore
      await deleteDoc(doc(db, 'files', file.id));
    } catch (err: any) {
      console.error('Delete Error:', err);
      setError(`Failed to delete file: ${err.message}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My Files</h1>
          <p className="text-slate-500 mt-1">Manage your documents and uploads securely.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`
          relative border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer
          flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {uploading ? 'Uploading documents...' : 'Upload new files'}
        </h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
          Drag and drop PDF or Word documents here, or click to browse files.
        </p>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Documents</h2>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {files.length} Files
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Loading your documents...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <File className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-600">No files found</p>
            <p className="text-sm">Start by uploading your first document above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Uploaded</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredFiles.map((file) => (
                    <motion.tr 
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-slate-900 truncate max-w-[200px] lg:max-w-md">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {file.createdAt.toDate().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDelete(file)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;
