const QuietRecognition = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-12 md:mb-16 opacity-0 animate-fadeIn">
      <div className="bg-muted/20 border border-border/50 rounded-lg p-6 md:p-8">
        <p className="text-base md:text-lg text-foreground leading-relaxed text-center">
          {message}
        </p>
      </div>
    </div>
  );
};

export default QuietRecognition;