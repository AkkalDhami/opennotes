export function TextGlitch({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden">
      <span className="invisible">{text}</span>
      <span className="absolute top-0 left-0 font-medium transition-transform duration-500 ease-in-out group-hover:-translate-y-full hover:duration-300">
        {text}
      </span>
      <span className="absolute top-0 left-0 translate-y-full font-medium transition-transform duration-500 ease-in-out group-hover:translate-y-0 hover:duration-300">
        {text}
      </span>
    </div>
  )
}
