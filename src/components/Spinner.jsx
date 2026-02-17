const Spinner = ({ label }) => {
  return (
    <div className="spinner">
      <div className="spinner__ring" />
      <span>{label}</span>
    </div>
  )
}

export default Spinner
