const WeeklyComparison = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="mb-12 md:mb-16">
      <div className="bg-muted/10 border border-border/30 rounded-xl p-6 md:p-8">
        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
          This Week
        </p>
        <p className="text-base md:text-lg text-foreground leading-relaxed">
          {comparison}
        </p>
      </div>
    </div>
  );
};

export default WeeklyComparison;