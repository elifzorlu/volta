import { useState } from 'react';

const ProductivityScore = ({ score, caption, explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-16 md:mb-20 lg:mb-24">
      <div className="flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
          How today felt
        </p>
        <div className="mb-4 md:mb-6">
          <div 
            className="text-8xl md:text-9xl lg:text-[10rem] font-bold tracking-tight transition-all duration-500"
            style={{ color: 'var(--color-accent)' }}
          >
            {score}
          </div>
        </div>
        
        <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
          {caption}
        </p>
        
        <div className="max-w-2xl">
          <p className="text-base md:text-lg lg:text-xl text-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityScore;