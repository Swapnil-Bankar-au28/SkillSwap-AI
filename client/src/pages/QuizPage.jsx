// src/pages/QuizPage.jsx
// AI Skill Verification Quiz interface

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Award, CheckCircle, XCircle, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function QuizPage() {
  const { skillName } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz]             = useState(null);
  const [answers, setAnswers]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [skillName]);

  const fetchQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const { data } = await api.post('/quiz/generate', { skillName });
      setQuiz(data);
    } catch {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIndex, optionIndex) => {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const formattedAnswers = quiz.questions.map((_, idx) => answers[idx]);
    if (formattedAnswers.some((a) => a === undefined)) {
      toast.error('Please answer all 5 questions before submitting!');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/quiz/submit', {
        quizId: quiz._id,
        answers: formattedAnswers,
      });
      setResult(data);
      if (data.passed) {
        toast.success('🎉 Skill Verified! "Verified Expert" badge awarded!');
      } else {
        toast.error(`Score: ${data.percentage}%. You need 80% to pass. Try again!`);
      }
    } catch {
      toast.error('Quiz submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Gemini AI is generating your verification quiz...</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Crafting 5 questions tailored to <strong>{skillName}</strong>
        </p>
      </div>
    );
  }

  if (!quiz) return <div className="page" style={{ textAlign: 'center', paddingTop: '5rem' }}>Quiz generation failed</div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <Sparkles size={18} color="var(--color-primary2)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary2)', textTransform: 'uppercase' }}>AI Skill Verification</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{skillName} Quiz</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Score 80% or higher to earn your <strong>Verified Expert</strong> badge</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>Back to Profile</button>
        </div>

        {/* Result Banner if submitted */}
        {result && (
          <div className="glass fade-in" style={{
            padding: '1.75rem',
            marginBottom: '1.5rem',
            background: result.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: result.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            {result.passed ? (
              <CheckCircle size={44} color="#10b981" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={44} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: result.passed ? '#10b981' : '#ef4444' }}>
                {result.passed ? 'Congratulations! Quiz Passed! 🎉' : 'Quiz Not Passed'}
              </h2>
              <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                You scored <strong>{result.percentage}%</strong> ({result.correctCount} of {result.total} correct).
                {result.passed ? ' Your "Verified Expert" badge is now active on your profile.' : ' Review the explanations below and try again!'}
              </p>
              <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile')}>Go to Profile</button>
                {!result.passed && (
                  <button className="btn btn-primary btn-sm" onClick={fetchQuiz}>
                    <RotateCcw size={14} /> Retry Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {quiz.questions.map((q, qIdx) => (
            <div key={qIdx} className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, background: 'var(--color-surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                }}>
                  {qIdx + 1}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 }}>{q.questionText}</h3>
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gap: '0.625rem', paddingLeft: '2.25rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[qIdx] === optIdx;
                  const isCorrect  = q.correctIndex === optIdx;
                  let optionStyle  = {
                    padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)', cursor: result ? 'default' : 'pointer', fontSize: '0.875rem',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  };

                  if (isSelected && !result) {
                    optionStyle.borderColor = 'var(--color-primary2)';
                    optionStyle.background = 'rgba(124, 58, 237, 0.15)';
                  }

                  if (result) {
                    if (isCorrect) {
                      optionStyle.borderColor = '#10b981';
                      optionStyle.background = 'rgba(16, 185, 129, 0.15)';
                    } else if (isSelected && !isCorrect) {
                      optionStyle.borderColor = '#ef4444';
                      optionStyle.background = 'rgba(239, 68, 68, 0.15)';
                    }
                  }

                  return (
                    <div key={optIdx} style={optionStyle} onClick={() => handleOptionSelect(qIdx, optIdx)}>
                      <span>{opt}</span>
                      {result && isCorrect && <CheckCircle size={16} color="#10b981" />}
                      {result && isSelected && !isCorrect && <XCircle size={16} color="#ef4444" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation when submitted */}
              {result && q.explanation && (
                <div style={{ marginTop: '1rem', marginLeft: '2.25rem', padding: '0.75rem 1rem', background: 'var(--color-surface2)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                  💡 <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Bar */}
        {!result && (
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting} id="submit-quiz-btn">
              {submitting ? 'Evaluating...' : 'Submit Answers & Verify'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
