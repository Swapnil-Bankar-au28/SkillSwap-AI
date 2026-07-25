// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SkillCard from '../components/SkillCard';
import toast from 'react-hot-toast';
import { User, MapPin, FileText, Plus, ChevronDown, ChevronUp, Star } from 'lucide-react';

const CATEGORIES = ['Music', 'Design', 'Technology', 'Languages', 'Sports', 'Cooking', 'Business', 'Academic', 'Art', 'General'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [bioForm, setBioForm]           = useState({ name: '', bio: '', location: '' });
  const [showOfferedForm, setShowOfferedForm] = useState(false);
  const [showWantedForm, setShowWantedForm]   = useState(false);
  const [offeredForm, setOfferedForm]   = useState({ skillName: '', category: 'General', proficiency: 'Intermediate', description: '' });
  const [wantedForm, setWantedForm]     = useState({ skillName: '', category: 'General', urgency: 'Medium', description: '' });
  const [addingOffered, setAddingOffered] = useState(false);
  const [addingWanted, setAddingWanted]   = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setProfile(data);
      setBioForm({ name: data.name, bio: data.bio || '', location: data.location || '' });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const saveBio = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', bioForm);
      setProfile(data);
      updateUser(data);
      toast.success('Profile saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const addOfferedSkill = async (e) => {
    e.preventDefault();
    setAddingOffered(true);
    try {
      await api.post('/users/me/skills/offered', offeredForm);
      await fetchProfile();
      setOfferedForm({ skillName: '', category: 'General', proficiency: 'Intermediate', description: '' });
      setShowOfferedForm(false);
      toast.success('Skill added!');
    } catch { toast.error('Failed to add skill'); }
    finally { setAddingOffered(false); }
  };

  const addWantedSkill = async (e) => {
    e.preventDefault();
    setAddingWanted(true);
    try {
      await api.post('/users/me/skills/wanted', wantedForm);
      await fetchProfile();
      setWantedForm({ skillName: '', category: 'General', urgency: 'Medium', description: '' });
      setShowWantedForm(false);
      toast.success('Skill added!');
    } catch { toast.error('Failed to add skill'); }
    finally { setAddingWanted(false); }
  };

  const deleteOffered = async (id) => {
    try {
      await api.delete(`/users/me/skills/offered/${id}`);
      await fetchProfile();
      toast.success('Skill removed');
    } catch { toast.error('Failed to remove skill'); }
  };

  const deleteWanted = async (id) => {
    try {
      await api.delete(`/users/me/skills/wanted/${id}`);
      await fetchProfile();
      toast.success('Skill removed');
    } catch { toast.error('Failed to remove skill'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Your Profile</h1>
        <p className="page-subtitle">Manage your identity and skill listings</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── Bio Form ──────────────────────────────── */}
          <div>
            <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> Profile Info
              </h2>

              {/* Rating display */}
              {profile?.rating?.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1rem', padding: '0.625rem 1rem', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Star size={16} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontWeight: 700 }}>{profile.rating.average.toFixed(1)}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>({profile.rating.count} ratings)</span>
                </div>
              )}

              <form onSubmit={saveBio}>
                <div className="form-group">
                  <label className="label">Name</label>
                  <input className="input" value={bioForm.name} onChange={(e) => setBioForm({ ...bioForm, name: e.target.value })} id="profile-name" />
                </div>
                <div className="form-group">
                  <label className="label"><MapPin size={14} style={{ verticalAlign: 'middle' }} /> Location</label>
                  <input className="input" placeholder="City, Country" value={bioForm.location} onChange={(e) => setBioForm({ ...bioForm, location: e.target.value })} id="profile-location" />
                </div>
                <div className="form-group">
                  <label className="label"><FileText size={14} style={{ verticalAlign: 'middle' }} /> Bio</label>
                  <textarea className="input" rows={3} placeholder="Tell others about yourself..." value={bioForm.bio} onChange={(e) => setBioForm({ ...bioForm, bio: e.target.value })} id="profile-bio" style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Skills ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Skills Offered */}
            <div className="glass" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  ✨ Skills I Offer <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '0.875rem' }}>({profile?.skillsOffered?.length || 0})</span>
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowOfferedForm(!showOfferedForm)} id="add-offered-btn">
                  {showOfferedForm ? <ChevronUp size={16} /> : <Plus size={16} />}
                  {showOfferedForm ? 'Cancel' : 'Add'}
                </button>
              </div>

              {showOfferedForm && (
                <form onSubmit={addOfferedSkill} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-surface2)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                  <div className="form-group">
                    <label className="label">Skill Name *</label>
                    <input className="input" placeholder="e.g. Guitar, React, Yoga" value={offeredForm.skillName} onChange={(e) => setOfferedForm({ ...offeredForm, skillName: e.target.value })} required id="offered-skill-name" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="label">Category</label>
                      <select className="input" value={offeredForm.category} onChange={(e) => setOfferedForm({ ...offeredForm, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Proficiency</label>
                      <select className="input" value={offeredForm.proficiency} onChange={(e) => setOfferedForm({ ...offeredForm, proficiency: e.target.value })}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Description (optional)</label>
                    <input className="input" placeholder="Brief description..." value={offeredForm.description} onChange={(e) => setOfferedForm({ ...offeredForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingOffered}>
                    {addingOffered ? 'Adding...' : 'Add Skill'}
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {profile?.skillsOffered?.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No skills added yet. Click "Add" above!</p>
                ) : (
                  profile.skillsOffered.map((s) => <SkillCard key={s._id} skill={s} type="offered" onDelete={deleteOffered} />)
                )}
              </div>
            </div>

            {/* Skills Wanted */}
            <div className="glass" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  🎯 Skills I Want <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '0.875rem' }}>({profile?.skillsWanted?.length || 0})</span>
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowWantedForm(!showWantedForm)} id="add-wanted-btn">
                  {showWantedForm ? <ChevronUp size={16} /> : <Plus size={16} />}
                  {showWantedForm ? 'Cancel' : 'Add'}
                </button>
              </div>

              {showWantedForm && (
                <form onSubmit={addWantedSkill} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-surface2)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                  <div className="form-group">
                    <label className="label">Skill Name *</label>
                    <input className="input" placeholder="e.g. Logo Design, Python, French" value={wantedForm.skillName} onChange={(e) => setWantedForm({ ...wantedForm, skillName: e.target.value })} required id="wanted-skill-name" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="label">Category</label>
                      <select className="input" value={wantedForm.category} onChange={(e) => setWantedForm({ ...wantedForm, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Urgency</label>
                      <select className="input" value={wantedForm.urgency} onChange={(e) => setWantedForm({ ...wantedForm, urgency: e.target.value })}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Description (optional)</label>
                    <input className="input" placeholder="What level do you want to reach?" value={wantedForm.description} onChange={(e) => setWantedForm({ ...wantedForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingWanted}>
                    {addingWanted ? 'Adding...' : 'Add Skill'}
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {profile?.skillsWanted?.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No skills added yet. Click "Add" above!</p>
                ) : (
                  profile.skillsWanted.map((s) => <SkillCard key={s._id} skill={s} type="wanted" onDelete={deleteWanted} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
