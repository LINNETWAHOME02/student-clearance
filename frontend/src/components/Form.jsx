import React, { useState } from 'react';
import { Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react';

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
          // Append single file
          formDataToSubmit.append(fieldName, files[0]);
        } else {
          // Append each file with the same field name
          files.forEach(file => {
            formDataToSubmit.append(fieldName, file);
          });
        }
      }
    });

    // Call the onSubmit handler with FormData
    onSubmit(formDataToSubmit);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    return <File className="w-4 h-4 text-green-500" />;
  };

  // Determine grid column span based on field properties
  const getFieldColumnSpan = (field) => {
    // Full width fields
    if (field.type === 'textarea' || field.fullWidth) {
      return 'col-span-full';
    }
    
    // Small fields that can share space
    if (field.compact || field.type === 'date' || field.type === 'number' || 
        (field.type === 'text' && field.name.includes('name')) ||
        (field.type === 'select' && field.options && field.options.length <= 5)) {
      return 'col-span-full sm:col-span-1';
    }
    
    // Medium fields
    if (field.type === 'email' || field.type === 'password' || 
        (field.type === 'select' && field.options && field.options.length > 5)) {
      return 'col-span-full md:col-span-1';
    }
    
    // Default to full width
    return 'col-span-full';
  };

  const renderField = (field) => {
    const baseClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md";
    const errorClasses = errors[field.name] ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50" : "";
    const disabledClasses = field.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "";

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
            className={`${baseClasses} ${errorClasses} ${disabledClasses} resize-none`}
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
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
              disabled={field.disabled}
            />
            <label htmlFor={field.name} className="ml-3 text-sm font-medium text-gray-700">
              {field.checkboxLabel || field.label}
            </label>
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {field.options.map((option) => (
              <div key={option.value} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                  disabled={field.disabled}
                />
                <label htmlFor={`${field.name}-${option.value}`} className="ml-3 text-sm font-medium text-gray-700">
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <div className="mt-2 h-1 w-20 bg-white/30 rounded-full"></div>
          </div>
          
          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dynamic Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {fields.map((field) => (
                  <div key={field.name} className={`space-y-2 ${getFieldColumnSpan(field)}`}>
                    {field.type !== 'checkbox' && (
                      <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    
                    {renderField(field)}
                    
                    {errors[field.name] && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}
                    
                    {field.helpText && (
                      <p className="text-gray-500 text-xs">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* File Upload Fields */}
              {fileUploadFields.length > 0 && (
                <div className="space-y-6 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    File Attachments
                  </h3>
                  
                  <div className={`grid ${fileUploadFields.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
                    {fileUploadFields.map((uploadField) => (
                      <div key={uploadField.name} className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                          {uploadField.label}
                          {uploadField.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 bg-gradient-to-br from-gray-50 to-white">
                          <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <label htmlFor={`file-${uploadField.name}`} className="cursor-pointer">
                                <span className="block text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {uploadField.uploadText || 'Click to upload files'}
                                </span>
                                <span className="mt-2 block text-xs text-gray-500">
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
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-700">Uploaded Files:</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {uploadedFiles[uploadField.name].map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                      {getFileIcon(file.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium text-gray-700 truncate block">{file.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(uploadField.name, index)}
                                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {errors[uploadField.name] && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{errors[uploadField.name]}</span>
                          </div>
                        )}
                        
                        {uploadField.helpText && (
                          <p className="text-gray-500 text-xs">{uploadField.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {submitButtonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;