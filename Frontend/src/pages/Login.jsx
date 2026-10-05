
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import { auth, getApiError } from '../services/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Login request
      const r = await auth.post('auth/login/', {
        phone,
        password,
      });

      // Save tokens
      localStorage.setItem(
        'access_token',
        r.data.token?.access || ''
      );

      localStorage.setItem(
        'refresh_token',
        r.data.token?.refresh || ''
      );

      // Save user information
      localStorage.setItem(
        'username',
        r.data.username || ''
      );

      localStorage.setItem(
        'role',
        r.data.role || ''
      );

      // Go to dashboard
      nav('/dashboard');

    } catch (err) {
      console.error('Login error:', err);

      setError(
        getApiError(
          err,
          'Login failed. Please check your phone number and password.'
        )
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">

      <div className="login-art">

        <div className="login-brand">
          <Sprout />
          <b>FarmLedger</b>
        </div>

        <div className="art-copy">

          <p className="eyebrow">
            SMART FARM MANAGEMENT
          </p>

          <h1>
            Everything your farm needs,{' '}
            <span>in one place.</span>
          </h1>

          <p>
            Track income, expenses, production and
            performance with a simple farm management system.
          </p>

          <div className="art-stats">

            <div>
              <b>24/7</b>
              <span>Farm visibility</span>
            </div>

            <div>
              <b>100%</b>
              <span>Organized records</span>
            </div>

          </div>

        </div>

      </div>


      <div className="login-panel">

        <form
          className="login-card"
          onSubmit={submit}
        >

          <div className="mobile-logo">
            <Sprout size={24} />
          </div>

          <h2>Welcome back</h2>

          <p>
            Sign in to your FarmLedger account.
          </p>


          {/* Error message */}

          {error && (
            <div className="alert">
              {error}
            </div>
          )}


          {/* Phone */}

          <label>
            Phone number

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
          </label>


          {/* Password */}

          <label>
            Password

            <div className="password">

              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
              >
                {show ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </label>


          {/* Login button */}

          <button
            className="primary full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>


          <div className="login-foot">
            FarmLedger · Farm management dashboard
          </div>

        </form>

      </div>

    </div>
  );
}

