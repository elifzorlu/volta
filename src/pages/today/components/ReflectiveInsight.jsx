const ReflectiveInsight = ({ insight }) => {
  if (!insight) return null;

  return (
    <div className="mt-16 md:mt-20 pt-8 border-t border-border/50">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic">
          {insight}
        </p>
      </div>
    </div>
  );
};

export default ReflectiveInsight;