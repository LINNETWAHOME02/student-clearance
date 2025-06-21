import React, { useState } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';

const Form = ({ 
  title = "",
  fields = [],
  fileUploadFields = [],
  onSubmit,
  submitButtonText = "Submit",
  initialValues = {},
  showCancelButton = false,
  onCancel,
  className = ""
}) => {
  const [formData, setFormData] = useState(() => {
    const initial = { ...initialValues };
    fields.forEach(field => {
      if (!(field.name in initial)) {
        initial[field.name] = field.type === 'checkbox' ? false : '';
      }
    });
    return initial;
  });

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const initial = {};
    fileUploadFields.forEach(field => {
      initial[field.name] = [];
    });
    return initial;
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (fieldName, files) => {
    const fileArray = Array.from(files);
    const uploadField = fileUploadFields.find(field => field.name === fieldName);
    
    // Check file size limit (default 10MB)
    const maxSize = (uploadField?.maxSize || 10) * 1024 * 1024;
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: `File ${file.name} is too large. Maximum size is ${uploadField?.maxSize || 10}MB`
        }));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: uploadField?.multiple === false 
          ? validFiles.slice(0, 1) // Only keep first file if not multiple
          : [...(prev[fieldName] || []), ...validFiles]
      }));
      
      // Clear any previous errors
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    }
  };

  const removeFile = (fieldName, index) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
      }
    });

    fileUploadFields.forEach(field => {
      if (field.required && (!uploadedFiles[field.name] || uploadedFiles[field.name].length === 0)) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    // Create FormData object (this is the React equivalent of enctype="multipart/form-data")
    const formDataToSubmit = new FormData();

    // Append all regular form fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSubmit.append(key, value);
    });

    // Append all files
    Object.entries(uploadedFiles).forEach(([fieldName, files]) => {
      const uploadField = fileUploadFields.find(field => field.name === fieldName);
      
      if (files && files.length > 0) {
        if (uploadField?.multiple === false) {
          // Single file upload
          formDataToSubmit.append(fieldName, files[0]);
        } else {
          // Multiple files - append each with the same field name
          files.forEach((file, index) => {
            formDataToSubmit.append(`${fieldName}[]`, file);
          });
        }
      }
    });

    // Call the onSubmit handler with FormData
    onSubmit(formDataToSubmit);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const renderField = (field) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const errorClasses = errors[field.name] ? "border-red-500" : "";
    const disabledClasses = field.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "";

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} ${errorClasses} ${disabledClasses}`}
            min={field.min}
            max={field.max}
            disabled={field.disabled}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} resize-vertical`}
            disabled={field.disabled}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`${baseClasses} ${errorClasses} ${disabledClasses}`}
            disabled={field.disabled}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              disabled={field.disabled}
            />
            <label htmlFor={field.name} className="ml-2 text-sm text-gray-700">
              {field.checkboxLabel || field.label}
            </label>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  disabled={field.disabled}
                />
                <label htmlFor={`${field.name}-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      
        <div className="space-y-6">
          {/* Dynamic Form Fields */}
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              
              {renderField(field)}
              
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
              
              {field.helpText && (
                <p className="text-gray-500 text-xs mt-1">{field.helpText}</p>
              )}
            </div>
          ))}

          {/* Dynamic File Upload Fields */}
          {fileUploadFields.map((uploadField) => (
            <div key={uploadField.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {uploadField.label}
                {uploadField.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor={`file-${uploadField.name}`} className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {uploadField.uploadText || 'Click to upload files'}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {uploadField.acceptedTypes || 'PDF, DOC, DOCX, JPG, PNG up to 10MB'}
                      </span>
                    </label>
                    <input
                      id={`file-${uploadField.name}`}
                      type="file"
                      className="hidden"
                      multiple={uploadField.multiple !== false}
                      accept={uploadField.accept}
                      onChange={(e) => handleFileUpload(uploadField.name, e.target.files)}
                    />
                  </div>
                </div>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles[uploadField.name] && uploadedFiles[uploadField.name].length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                  {uploadedFiles[uploadField.name].map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.type)}
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(uploadField.name, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors[uploadField.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[uploadField.name]}</p>
              )}
              
              {uploadField.helpText && (
                <p className="text-gray-500 text-xs mt-1">{uploadField.helpText}</p>
              )}
            </div>
          ))}

          <div className="flex justify-between space-x-4 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {submitButtonText}
            </button>
            
            {showCancelButton && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

export default Form;