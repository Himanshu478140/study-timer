interface EmptyScheduleProps {
  message: string;
}

export const EmptySchedule = ({ message }: EmptyScheduleProps) => {
  return (
    <div style={{
      padding: '2rem 1rem',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '0.8rem'
    }}>
      {message}
    </div>
  );
};
