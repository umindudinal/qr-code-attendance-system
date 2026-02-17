import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import QRCode from 'qrcode'
import { getJson } from '../api/client'
import AppShell from '../components/AppShell'
import ChartCard from '../components/ChartCard'
import QRCard from '../components/QRCard'
import Spinner from '../components/Spinner'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { formatShortDate, formatTime } from '../utils/date'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState(null)
  const [adminSummary, setAdminSummary] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [qrExpiresAt, setQrExpiresAt] = useState('')
  const [error, setError] = useState('')

  const refreshQr = async () => {
    const data = await getJson('/api/users/me/qr-token')
    const url = await QRCode.toDataURL(data.qrToken, { margin: 1, width: 220 })
    setQrUrl(url)
    setQrExpiresAt(new Date(data.expiresAt).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }))
  }

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      setLoading(true)
      try {
        const requests = [getJson('/api/attendance/me'), refreshQr()]
        if (user?.role === 'admin') {
          requests.push(getJson('/api/attendance/summary'))
        }
        const [attendanceResponse, , summaryResponse] = await Promise.all(requests)
        if (mounted) {
          setAttendance(attendanceResponse)
          setAdminSummary(summaryResponse || null)
          setError('')
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Unable to load dashboard data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    const interval = setInterval(() => {
      refreshQr().catch(() => {})
    }, 1000 * 60 * 5)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [user])

  const dailyData = useMemo(() => attendance?.daily || [], [attendance])
  const adminDaily = useMemo(() => adminSummary?.daily || [], [adminSummary])

  if (loading) {
    return (
      <AppShell>
        <Spinner label="Loading dashboard" />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {error && <p className="form__error">{error}</p>}

      <section className="grid grid--stats">
        <StatCard label="Attendance total" value={attendance?.total || 0} hint="All-time scans" />
        <StatCard label="Current streak" value={attendance?.streak || 0} hint="Days in a row" />
        <StatCard
          label="Last scan"
          value={attendance?.recent?.[0] ? formatShortDate(attendance.recent[0].scannedAt) : 'No scans'}
          hint={attendance?.recent?.[0] ? formatTime(attendance.recent[0].scannedAt) : 'Scan your QR to start'}
        />
      </section>

      <section className="grid grid--main">
        <QRCard qrUrl={qrUrl} expiresAt={qrExpiresAt && `${qrExpiresAt} local time`} />

        <ChartCard title="Your last 7 days" subtitle="Attendance validation resets at 00:00 UTC">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} scan`, 'Attendance']} />
              <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {user?.role === 'admin' && (
        <section className="grid grid--admin">
          <StatCard label="Active users" value={adminSummary?.totals?.users || 0} hint="Registered accounts" />
          <StatCard label="Today" value={adminSummary?.totals?.today || 0} hint="Scans across org" />
          <StatCard label="This month" value={adminSummary?.totals?.month || 0} hint="Unique attendance days" />

          <ChartCard title="Organization activity" subtitle="Total scans per day">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={adminDaily} margin={{ left: -16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} scans`, 'Attendance']} />
                <Bar dataKey="count" fill="var(--accent-strong)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      )}

      <section className="card recent-card">
        <div className="recent-card__header">
          <h3>Recent attendance</h3>
          <p className="muted">Validated entries for your profile</p>
        </div>
        <div className="recent-card__list">
          {attendance?.recent?.length ? (
            attendance.recent.map((entry) => (
              <div key={entry._id} className="recent-card__item">
                <div>
                  <p>{formatShortDate(entry.scannedAt)}</p>
                  <span>{formatTime(entry.scannedAt)}</span>
                </div>
                <span className="pill">Confirmed</span>
              </div>
            ))
          ) : (
            <p className="muted">No attendance recorded yet.</p>
          )}
        </div>
      </section>
    </AppShell>
  )
}

export default Dashboard
