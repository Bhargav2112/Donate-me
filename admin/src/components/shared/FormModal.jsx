import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FormModal({ open, onClose, title, fields, values, onChange, onSubmit, loading }) {
  const handleChange = (key, val) => onChange({ ...values, [key]: val });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4 mt-2">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs font-medium">{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</Label>
              {f.type === 'select' ? (
                <Select value={values[f.key] || ''} onValueChange={v => handleChange(f.key, v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`Select ${f.label}`} /></SelectTrigger>
                  <SelectContent>
                    {f.options.map(o => {
                      const val = typeof o === 'object' ? o.value : o;
                      const label = typeof o === 'object' ? o.label : o;
                      return <SelectItem key={val} value={val}>{label}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              ) : f.type === 'textarea' ? (
                <Textarea
                  value={values[f.key] || ''}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder || ''}
                  className="text-sm resize-none"
                  rows={3}
                />
              ) : f.type === 'file' ? (
                <div className="space-y-2">
                  {values[f.key] ? (
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border group bg-muted flex items-center justify-center">
                      <img
                        src={typeof values[f.key] === 'string' ? values[f.key] : URL.createObjectURL(values[f.key])}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange(f.key, '')}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => handleChange(f.key, e.target.files[0])}
                      className="text-sm h-9"
                    />
                  )}
                </div>
              ) : (
                <Input
                  type={f.type || 'text'}
                  value={values[f.key] || ''}
                  onChange={e => handleChange(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                  placeholder={f.placeholder || ''}
                  required={f.required}
                  className="h-9 text-sm"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}