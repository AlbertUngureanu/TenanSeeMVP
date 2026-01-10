import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/apiService'
import './ScheduleVisitModal.css'

function ScheduleVisitModal({ propertyId, isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (isOpen && selectedDate) {
      loadAvailableSlots()
    }
  }, [isOpen, selectedDate, propertyId])

  const loadAvailableSlots = async () => {
    if (!selectedDate) return
    
    try {
      const data = await apiService.getAvailableSlots(propertyId, selectedDate)
      setAvailableSlots(data.slots || [])
    } catch (err) {
      console.error('Error loading slots:', err)
      setError('Nu s-au putut încărca sloturile disponibile.')
    }
  }

  const handleDateSelect = (date) => {
    const dateStr = formatDate(date)
    setSelectedDate(dateStr)
    setSelectedTime('')
    setError('')
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setError('')
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Vă rugăm selectați data și ora.')
      return
    }

    if (!user) {
      setError('Trebuie să fiți autentificat pentru a programa o vizită.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await apiService.createVisit({
        property_id: propertyId,
        visit_date: selectedDate,
        visit_time: selectedTime
      })
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err.message || 'A apărut o eroare la programarea vizitei.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getMonthName = (date) => {
    const months = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ]
    return months[date.getMonth()]
  }

  const getDayName = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[dayIndex]
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    return formatDate(date) === selectedDate
  }

  const isDatePast = (date) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (!isOpen) return null

  const days = getDaysInMonth(currentMonth)
  const monthName = getMonthName(currentMonth)
  const year = currentMonth.getFullYear()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="schedule-visit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Programează o vizită</h2>

        <div className="modal-content">
          {/* Date Selection */}
          <div className="date-selection">
            <h3>Alege data</h3>
            <div className="calendar">
              <div className="calendar-header">
                <button className="calendar-nav" onClick={handlePrevMonth}>‹</button>
                <div className="calendar-month">
                  {monthName} {year}
                </div>
                <button className="calendar-nav" onClick={handleNextMonth}>›</button>
              </div>
              
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="calendar-day empty"></div>
                  }
                  const isSelected = isDateSelected(date)
                  const isPast = isDatePast(date)
                  
                  return (
                    <button
                      key={index}
                      className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                      onClick={() => !isPast && handleDateSelect(date)}
                      disabled={isPast}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="time-selection">
            <h3>Alege un interval de timp</h3>
            {selectedDate ? (
              <div className="time-slots">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot ${slot.available ? '' : 'booked'} ${selectedTime === slot.time ? 'selected' : ''}`}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="time-placeholder">Selectați mai întâi o dată</p>
            )}
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Anulează
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || loading}
          >
            {loading ? 'Se procesează...' : 'Confirmă'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatTime(timeStr) {
  // Convert 24-hour format (HH:MM) to 12-hour format
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export default ScheduleVisitModal

