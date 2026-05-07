import React, { useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';

const SCHOOL_LOGO = 'data:image/jpeg;base64,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';
const SCHOOL_NAME = 'Akatsi Senior High Technical School';
const SCHOOL_MOTTO = 'Go Forth and Shine';
const SCHOOL_ADDRESS = 'Akatsi, Volta Region, Ghana';
const ACADEMIC_YEAR = '2025/2026';
const API_BASE = 'http://localhost:5000';

const StudentIDCard = ({ student, onClose }) => {
  const cardRef = useRef();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get full avatar URL
  const avatarUrl = student.avatar ? `${API_BASE}${student.avatar}` : null;

  const cardStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: Arial, sans-serif; }
    .id-card { width: 340px; height: 210px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3); position: relative; background: white; }
    .card-front { width: 100%; height: 100%; display: flex; flex-direction: column; }
    .card-header { background: linear-gradient(135deg, #1a6b2a, #2d8c3e); padding: 10px 12px 8px; display: flex; align-items: center; gap: 8px; }
    .logo { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #f5c518; object-fit: cover; flex-shrink: 0; }
    .school-info { flex: 1; }
    .school-name { color: #f5c518; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.2; }
    .school-motto { color: rgba(255,255,255,0.8); font-size: 7px; font-style: italic; margin-top: 1px; }
    .id-label { color: white; font-size: 7px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px; margin-top: 3px; display: inline-block; }
    .card-body { display: flex; flex: 1; padding: 10px 12px; gap: 10px; }
    .avatar-section { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .avatar { width: 70px; height: 75px; border-radius: 8px; border: 2px solid #2d8c3e; overflow: hidden; background: #e8f5e9; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #1a6b2a; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .student-id-badge { background: #f5c518; color: #1a1a1a; font-size: 7px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-align: center; width: 100%; }
    .info-section { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .student-name { font-size: 12px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; line-height: 1.2; border-bottom: 2px solid #f5c518; padding-bottom: 4px; margin-bottom: 4px; }
    .info-row { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
    .info-label { font-size: 7px; color: #666; font-weight: 600; text-transform: uppercase; min-width: 32px; }
    .info-value { font-size: 8px; color: #1a1a1a; font-weight: 500; }
    .card-footer { background: linear-gradient(135deg, #1a6b2a, #2d8c3e); padding: 5px 12px; display: flex; justify-content: space-between; align-items: center; }
    .footer-text { color: rgba(255,255,255,0.8); font-size: 7px; }
    .valid-badge { background: #f5c518; color: #1a1a1a; font-size: 7px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
    @media print { body { background: white; } }
  `;

  const buildCardHTML = () => `
    <div class="id-card">
      <div class="card-front">
        <div class="card-header">
          <img src="${SCHOOL_LOGO}" alt="Logo" class="logo" />
          <div class="school-info">
            <div class="school-name">${SCHOOL_NAME}</div>
            <div class="school-motto">"${SCHOOL_MOTTO}"</div>
            <div class="id-label">Student ID Card</div>
          </div>
        </div>
        <div class="card-body">
          <div class="avatar-section">
            <div class="avatar">
              ${avatarUrl
                ? `<img src="${avatarUrl}" alt="${student.name}" />`
                : student.name[0].toUpperCase()
              }
            </div>
            <div class="student-id-badge">${student.studentId}</div>
          </div>
          <div class="info-section">
            <div class="student-name">${student.name}</div>
            ${[
              { label: 'Class', value: student.classId?.name || 'N/A' },
              { label: 'Gender', value: student.gender || 'N/A' },
              { label: 'DOB', value: formatDate(student.dateOfBirth) },
              { label: 'Year', value: ACADEMIC_YEAR },
            ].map(({ label, value }) => `
              <div class="info-row">
                <span class="info-label">${label}:</span>
                <span class="info-value">${value}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card-footer">
          <span class="footer-text">${SCHOOL_ADDRESS}</span>
          <span class="valid-badge">VALID: ${ACADEMIC_YEAR}</span>
        </div>
      </div>
    </div>
  `;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Student ID - ${student.name}</title><style>${cardStyles}</style></head><body>${buildCardHTML()}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 800);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`<html><head><title>ID_${student.name}</title><style>${cardStyles}</style></head><body>${buildCardHTML()}</body></html>`],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ID_Card_${student.name.replace(/\s+/g, '_')}_${student.studentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">Student ID Card</h2>
            <p className="text-white/40 text-sm">Print or download the ID card below</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ID Card Preview */}
        <div ref={cardRef} className="flex justify-center mb-5">
          <div style={{
            width: '340px', height: '210px', borderRadius: '16px',
            overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            position: 'relative', background: 'white', fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1a6b2a, #2d8c3e)', padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={SCHOOL_LOGO} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #f5c518', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f5c518', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1.2 }}>{SCHOOL_NAME}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '7px', fontStyle: 'italic', marginTop: '1px' }}>"{SCHOOL_MOTTO}"</div>
                  <div style={{ color: 'white', fontSize: '7px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '3px', marginTop: '3px', display: 'inline-block' }}>Student ID Card</div>
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flex: 1, padding: '10px 12px', gap: '10px' }}>

                {/* Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '70px', height: '75px', borderRadius: '8px', border: '2px solid #2d8c3e', overflow: 'hidden', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: '#1a6b2a' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : student.name[0].toUpperCase()
                    }
                  </div>
                  <div style={{ background: '#f5c518', color: '#1a1a1a', fontSize: '7px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textAlign: 'center', width: '100%' }}>
                    {student.studentId}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', lineHeight: 1.2, borderBottom: '2px solid #f5c518', paddingBottom: '4px', marginBottom: '4px' }}>
                    {student.name}
                  </div>
                  {[
                    { label: 'Class', value: student.classId?.name || 'N/A' },
                    { label: 'Gender', value: student.gender || 'N/A' },
                    { label: 'DOB', value: formatDate(student.dateOfBirth) },
                    { label: 'Year', value: ACADEMIC_YEAR },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '7px', color: '#666', fontWeight: 600, textTransform: 'uppercase', minWidth: '32px' }}>{label}:</span>
                      <span style={{ fontSize: '8px', color: '#1a1a1a', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(135deg, #1a6b2a, #2d8c3e)', padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '7px' }}>{SCHOOL_ADDRESS}</span>
                <span style={{ background: '#f5c518', color: '#1a1a1a', fontSize: '7px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>VALID: {ACADEMIC_YEAR}</span>
              </div>

            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all">
            <Printer size={16} /> Print ID Card
          </button>
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-xl transition-all">
            <Download size={16} /> Download
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentIDCard;
