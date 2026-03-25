'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

const MBTI_OPTIONS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const CONSTELLATION_OPTIONS = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];

function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('xinzhai_anon_user_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('xinzhai_anon_user_id', id); }
  return id;
}

export default function ProfilePage() {
  const [occupation, setOccupation] = useState('');
  const [mbti, setMbti] = useState('');
  const [constellation, setConstellation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const id = getAnonId();
      const { data } = await supabase.from('user_settings').select('*').eq('id', id).single();
      if (data) {
        setOccupation(data.occupation || '');
        setMbti(data.mbti || '');
        setConstellation(data.constellation || '');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const id = getAnonId();
    await supabase.from('user_settings').upsert({
      id,
      occupation,
      mbti,
      constellation,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header title="我的" />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-sm text-[var(--color-text-muted)] mb-6">完善你的信息，AI 会更了解你</p>

        <div className="space-y-4">
          {/* 职业 */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border-light)]">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">你的职业 / 身份</label>
            <input
              type="text"
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              placeholder="比如：大三学生、设计师、自由职业…"
              className="w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] rounded-[var(--radius-sm)] px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--color-primary)] border border-[var(--color-border)]"
            />
          </div>

          {/* MBTI */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border-light)]">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">MBTI 类型</label>
            <div className="grid grid-cols-4 gap-2">
              {MBTI_OPTIONS.map(type => (
                <button
                  key={type}
                  onClick={() => setMbti(mbti === type ? '' : type)}
                  className={`py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all ${
                    mbti === type
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 星座 */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 border border-[var(--color-border-light)]">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">星座</label>
            <div className="grid grid-cols-4 gap-2">
              {CONSTELLATION_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setConstellation(constellation === c ? '' : c)}
                  className={`py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all ${
                    constellation === c
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
        >
          {saving ? '保存中…' : saved ? '已保存 ✓' : '保存'}
        </button>
      </main>
    </>
  );
}
