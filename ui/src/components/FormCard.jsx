import React, { useState } from 'react'

/**
 * Renders a dynamic CONFIG form card (LLM-built copy, backend-grounded fields).
 * Props:
 *   form: { title, description, fields:[{name,heading,description,example,type,required,value,error,options}], actions }
 *   onSubmit(values): structured submission
 *   onCancel(): cancel the flow
 */
function FormCard({ form, onSubmit, onCancel }) {
  const init = {}
  ;(form.fields || []).forEach(f => { init[f.name] = f.value != null ? String(f.value) : '' })
  const [values, setValues] = useState(init)
  const [submitted, setSubmitted] = useState(false)

  const setField = (name, v) => setValues(prev => ({ ...prev, [name]: v }))

  const requiredNames = (form.fields || []).filter(f => f.required).map(f => f.name)
  const allRequiredFilled = requiredNames.every(n => String(values[n] ?? '').trim() !== '')

  const handleSubmit = () => {
    if (!allRequiredFilled || submitted) return
    // send only non-empty values; backend validates + re-pops if needed
    const payload = {}
    Object.entries(values).forEach(([k, v]) => { if (String(v).trim() !== '') payload[k] = v })
    setSubmitted(true)
    onSubmit(payload)
  }

  const handleClear = () => setValues(prev => {
    const cleared = {}
    Object.keys(prev).forEach(k => { cleared[k] = '' })
    return cleared
  })

  const actions = form.actions || { submit: 'Continue', clear: 'Clear', cancel: 'Cancel' }

  const inputStyle = {
    width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc',
    fontSize: '0.9em', boxSizing: 'border-box', background: submitted ? '#f0f0f0' : '#fff'
  }

  const renderInput = (f) => {
    const common = {
      value: values[f.name] ?? '',
      disabled: submitted,
      placeholder: f.example ? `e.g. ${f.example}` : '',
      onChange: (e) => setField(f.name, e.target.value),
      style: inputStyle,
    }
    if (f.type === 'select') {
      return (
        <select {...common}>
          <option value="">— select —</option>
          {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    return <input type={f.type === 'number' ? 'number' : f.type === 'password' ? 'password' : 'text'} {...common} />
  }

  return (
    <div style={{ border: '1px solid #d9d9e3', borderRadius: 8, padding: 14, background: '#fafafe', margin: '4px 0', maxWidth: 460 }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.05em', marginBottom: 2 }}>{form.title}</div>
      {form.description && <div style={{ color: '#666', fontSize: '0.85em', marginBottom: 10 }}>{form.description}</div>}

      {(form.fields || []).map(f => (
        <div key={f.name} style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, marginBottom: 2 }}>
            {f.heading}{f.required && <span style={{ color: '#d33' }}> *</span>}
          </label>
          {f.description && <div style={{ color: '#888', fontSize: '0.78em', marginBottom: 4 }}>{f.description}</div>}
          {renderInput(f)}
          {f.error && <div style={{ color: '#d33', fontSize: '0.78em', marginTop: 3 }}>{f.error}</div>}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={!allRequiredFilled || submitted}
          style={{
            padding: '6px 16px', borderRadius: 4, border: 'none', fontSize: '0.9em',
            cursor: (allRequiredFilled && !submitted) ? 'pointer' : 'not-allowed',
            background: (allRequiredFilled && !submitted) ? '#667eea' : '#c7c7d1',
            color: '#fff', fontWeight: 600,
          }}
        >{actions.submit}</button>
        <button onClick={handleClear} disabled={submitted}
          style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: submitted ? 'not-allowed' : 'pointer', fontSize: '0.9em' }}
        >{actions.clear}</button>
        <button onClick={() => { if (!submitted) { setSubmitted(true); onCancel() } }} disabled={submitted}
          style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #e0a3a3', background: '#fff', color: '#c0392b', cursor: submitted ? 'not-allowed' : 'pointer', fontSize: '0.9em' }}
        >{actions.cancel}</button>
      </div>
      {submitted && <div style={{ color: '#888', fontSize: '0.78em', marginTop: 8 }}>Submitted.</div>}
    </div>
  )
}

export default FormCard
