import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ScreenshotShareMode = ({ brainSignature, sacredWindow, insightLine, category, productivityScore }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('gradient'); // 'gradient', 'minimal', 'bold'
  const screenshotRef = useRef(null);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'creative':
        return '✨';
      case 'analytical':
        return '🧠';
      case 'studying':
        return '📚';
      default:
        return '⚡';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'creative':
        return 'Creative Work';
      case 'analytical':
        return 'Analytical Work';
      case 'studying':
        return 'Studying';
      default:
        return 'Focus Work';
    }
  };

  const generateScreenshot = async (selectedTemplate) => {
    try {
      setIsGenerating(true);
      setTemplate(selectedTemplate);

      // Wait for template to update
      await new Promise(resolve => setTimeout(resolve, 150));

      const element = screenshotRef?.current;
      if (!element) {
        toast?.error('Screenshot element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        width: 1080,
        height: 1920
      });

      // Convert to blob and download
      canvas?.toBlob((blob) => {
        const url = URL?.createObjectURL(blob);
        const link = document?.createElement('a');
        link.href = url;
        link.download = `volta-story-${selectedTemplate}-${Date.now()}.png`;
        link?.click();
        URL?.revokeObjectURL(url);
        
        toast?.success('Instagram story ready! 🎉');
      });
    } catch (error) {
      console.error('Screenshot generation error:', error);
      toast?.error('Failed to generate screenshot');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!brainSignature && !sacredWindow && !insightLine && !productivityScore) {
    return null;
  }

  // Template: Gradient Vibes
  const GradientTemplate = () => (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0a0a0a 75%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '100px 80px'
      }}
    >
      {/* Decorative gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        right: '-200px',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57, 255, 136, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57, 255, 136, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{
            display: 'inline-block',
            padding: '16px 32px',
            background: 'rgba(57, 255, 136, 0.1)',
            border: '2px solid rgba(57, 255, 136, 0.3)',
            borderRadius: '50px',
            marginBottom: '40px'
          }}>
            <p style={{
              fontSize: '28px',
              color: '#39FF88',
              fontWeight: '600',
              letterSpacing: '3px',
              margin: 0
            }}>VOLTA</p>
          </div>
          <h1 style={{
            fontSize: '56px',
            color: '#EDEDED',
            fontWeight: '300',
            lineHeight: '1.2',
            margin: 0
          }}>My Brain Today</h1>
        </div>

        {/* Productivity Score */}
        {productivityScore && (
          <div style={{
            marginBottom: '80px',
            textAlign: 'center',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, rgba(57, 255, 136, 0.08) 0%, rgba(57, 255, 136, 0.03) 100%)',
            borderRadius: '32px',
            border: '2px solid rgba(57, 255, 136, 0.2)'
          }}>
            <p style={{
              fontSize: '24px',
              color: 'rgba(237, 237, 237, 0.5)',
              marginBottom: '20px',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>How Today Felt</p>
            <div style={{
              fontSize: '180px',
              fontWeight: '700',
              color: '#39FF88',
              lineHeight: '1',
              marginBottom: '20px'
            }}>{productivityScore?.score || '8'}</div>
            <p style={{
              fontSize: '32px',
              color: '#EDEDED',
              margin: 0
            }}>{productivityScore?.caption || 'Productive day'}</p>
          </div>
        )}

        {/* Brain Signature */}
        {brainSignature && (
          <div style={{ marginBottom: '80px' }}>
            <p style={{
              fontSize: '24px',
              color: 'rgba(237, 237, 237, 0.5)',
              marginBottom: '30px',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>Brain Signature</p>
            <div style={{
              padding: '40px',
              background: 'rgba(57, 255, 136, 0.05)',
              border: '2px solid rgba(57, 255, 136, 0.3)',
              borderRadius: '24px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '64px',
                fontWeight: '600',
                color: '#39FF88',
                margin: 0,
                lineHeight: '1.1'
              }}>{brainSignature?.signature}</h2>
            </div>
            <p style={{
              fontSize: '28px',
              color: 'rgba(237, 237, 237, 0.9)',
              lineHeight: '1.5',
              margin: 0
            }}>{brainSignature?.explanation}</p>
          </div>
        )}

        {/* Sacred Focus Window */}
        {sacredWindow && (
          <div style={{
            padding: '50px',
            background: 'rgba(57, 255, 136, 0.08)',
            border: '3px solid rgba(57, 255, 136, 0.4)',
            borderRadius: '28px',
            marginBottom: '80px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <span style={{ fontSize: '48px' }}>{getCategoryIcon(category)}</span>
              <p style={{
                fontSize: '24px',
                color: 'rgba(237, 237, 237, 0.6)',
                margin: 0,
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>Peak Focus Window</p>
            </div>
            <h3 style={{
              fontSize: '72px',
              fontWeight: '600',
              color: '#39FF88',
              margin: '0 0 20px 0',
              lineHeight: '1'
            }}>{sacredWindow?.window?.start} - {sacredWindow?.window?.end}</h3>
            <p style={{
              fontSize: '36px',
              color: '#EDEDED',
              margin: 0
            }}>{getCategoryLabel(category)}</p>
          </div>
        )}

        {/* Daily Insight */}
        {insightLine && (
          <div style={{
            padding: '50px 40px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '6px solid #39FF88',
            borderRadius: '16px'
          }}>
            <p style={{
              fontSize: '36px',
              color: '#EDEDED',
              lineHeight: '1.5',
              fontStyle: 'italic',
              margin: 0
            }}>"{insightLine}"</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        paddingTop: '60px',
        borderTop: '1px solid rgba(57, 255, 136, 0.2)'
      }}>
        <p style={{
          fontSize: '24px',
          color: 'rgba(237, 237, 237, 0.4)',
          margin: 0
        }}>Track your brain's best hours</p>
      </div>
    </div>
  );

  // Template: Minimal Clean
  const MinimalTemplate = () => (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 100px',
        position: 'relative'
      }}
    >
      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(57, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 136, 0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.3
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center' }}>
        {/* Productivity Score - Hero */}
        {productivityScore && (
          <div style={{ marginBottom: '100px' }}>
            <div style={{
              fontSize: '280px',
              fontWeight: '800',
              color: '#39FF88',
              lineHeight: '1',
              marginBottom: '40px',
              textShadow: '0 0 80px rgba(57, 255, 136, 0.3)'
            }}>{productivityScore?.score || '8'}</div>
            <p style={{
              fontSize: '42px',
              color: '#EDEDED',
              fontWeight: '300',
              margin: 0
            }}>{productivityScore?.caption || 'Productive day'}</p>
          </div>
        )}

        {/* Brain Signature */}
        {brainSignature && (
          <div style={{ marginBottom: '100px' }}>
            <h2 style={{
              fontSize: '72px',
              fontWeight: '700',
              color: '#39FF88',
              marginBottom: '40px',
              lineHeight: '1.1'
            }}>{brainSignature?.signature}</h2>
            <p style={{
              fontSize: '32px',
              color: 'rgba(237, 237, 237, 0.8)',
              lineHeight: '1.6',
              maxWidth: '800px',
              margin: '0 auto'
            }}>{brainSignature?.explanation}</p>
          </div>
        )}

        {/* Sacred Window */}
        {sacredWindow && (
          <div style={{
            padding: '60px',
            border: '3px solid #39FF88',
            borderRadius: '24px',
            marginBottom: '100px'
          }}>
            <p style={{
              fontSize: '28px',
              color: 'rgba(237, 237, 237, 0.5)',
              marginBottom: '30px',
              letterSpacing: '3px'
            }}>PEAK HOURS</p>
            <h3 style={{
              fontSize: '80px',
              fontWeight: '700',
              color: '#EDEDED',
              margin: 0,
              lineHeight: '1'
            }}>{sacredWindow?.window?.start} - {sacredWindow?.window?.end}</h3>
          </div>
        )}

        {/* Insight Quote */}
        {insightLine && (
          <div style={{ marginBottom: '80px' }}>
            <p style={{
              fontSize: '38px',
              color: '#EDEDED',
              lineHeight: '1.5',
              fontStyle: 'italic',
              maxWidth: '850px',
              margin: '0 auto'
            }}>"{insightLine}"</p>
          </div>
        )}

        {/* Branding */}
        <div style={{
          marginTop: '120px',
          paddingTop: '60px',
          borderTop: '2px solid rgba(57, 255, 136, 0.2)'
        }}>
          <p style={{
            fontSize: '32px',
            color: '#39FF88',
            fontWeight: '700',
            letterSpacing: '4px',
            margin: 0
          }}>VOLTA</p>
        </div>
      </div>
    </div>
  );

  // Template: Bold Impact
  const BoldTemplate = () => (
    <div
      style={{
        width: '1080px',
        height: '1920px',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Bold accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '20px',
        height: '100%',
        background: 'linear-gradient(180deg, #39FF88 0%, rgba(57, 255, 136, 0.3) 100%)'
      }} />

      {/* Diagonal accent */}
      <div style={{
        position: 'absolute',
        top: '-400px',
        right: '-400px',
        width: '1000px',
        height: '1000px',
        background: 'linear-gradient(135deg, transparent 0%, rgba(57, 255, 136, 0.05) 50%, transparent 100%)',
        transform: 'rotate(45deg)'
      }} />

      <div style={{
        padding: '100px 80px 100px 120px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div>
          <div style={{
            display: 'inline-block',
            background: '#39FF88',
            padding: '20px 40px',
            marginBottom: '60px'
          }}>
            <p style={{
              fontSize: '32px',
              color: '#000000',
              fontWeight: '800',
              letterSpacing: '4px',
              margin: 0
            }}>VOLTA</p>
          </div>

          {/* Productivity Score */}
          {productivityScore && (
            <div style={{ marginBottom: '80px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '30px',
                marginBottom: '30px'
              }}>
                <div style={{
                  fontSize: '220px',
                  fontWeight: '900',
                  color: '#39FF88',
                  lineHeight: '1',
                  textShadow: '8px 8px 0px rgba(57, 255, 136, 0.2)'
                }}>{productivityScore?.score || '8'}</div>
                <div style={{
                  fontSize: '48px',
                  color: '#EDEDED',
                  fontWeight: '300',
                  maxWidth: '400px',
                  lineHeight: '1.2'
                }}>{productivityScore?.caption || 'Productive'}</div>
              </div>
            </div>
          )}

          {/* Brain Signature */}
          {brainSignature && (
            <div style={{
              marginBottom: '80px',
              padding: '50px',
              background: 'rgba(57, 255, 136, 0.05)',
              borderLeft: '8px solid #39FF88'
            }}>
              <p style={{
                fontSize: '26px',
                color: 'rgba(237, 237, 237, 0.5)',
                marginBottom: '25px',
                letterSpacing: '3px',
                textTransform: 'uppercase'
              }}>Your Brain Type</p>
              <h2 style={{
                fontSize: '68px',
                fontWeight: '800',
                color: '#39FF88',
                marginBottom: '30px',
                lineHeight: '1.1',
                textTransform: 'uppercase'
              }}>{brainSignature?.signature}</h2>
              <p style={{
                fontSize: '30px',
                color: '#EDEDED',
                lineHeight: '1.5',
                margin: 0
              }}>{brainSignature?.explanation}</p>
            </div>
          )}

          {/* Sacred Window */}
          {sacredWindow && (
            <div style={{
              background: '#39FF88',
              padding: '50px',
              marginBottom: '80px'
            }}>
              <p style={{
                fontSize: '24px',
                color: '#000000',
                marginBottom: '20px',
                letterSpacing: '3px',
                fontWeight: '600'
              }}>⚡ PEAK FOCUS WINDOW</p>
              <h3 style={{
                fontSize: '76px',
                fontWeight: '900',
                color: '#000000',
                margin: 0,
                lineHeight: '1'
              }}>{sacredWindow?.window?.start} - {sacredWindow?.window?.end}</h3>
            </div>
          )}

          {/* Insight */}
          {insightLine && (
            <div style={{
              padding: '50px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderTop: '4px solid #39FF88',
              borderBottom: '4px solid #39FF88'
            }}>
              <p style={{
                fontSize: '36px',
                color: '#EDEDED',
                lineHeight: '1.5',
                fontWeight: '500',
                margin: 0
              }}>"{insightLine}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div>
          <p style={{
            fontSize: '26px',
            color: 'rgba(237, 237, 237, 0.4)',
            margin: 0
          }}>Know your brain. Own your time.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-16 md:mb-20">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#EDEDED',
            border: '1px solid rgba(57, 255, 136, 0.3)'
          },
          success: {
            iconTheme: {
              primary: '#39FF88',
              secondary: '#000000'
            }
          },
          error: {
            iconTheme: {
              primary: '#FF4444',
              secondary: '#FFFFFF'
            }
          }
        }}
      />

      {/* Screenshot Preview (Hidden) */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div ref={screenshotRef}>
          {template === 'gradient' && <GradientTemplate />}
          {template === 'minimal' && <MinimalTemplate />}
          {template === 'bold' && <BoldTemplate />}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/30 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>📸</span>
              Share to Instagram Stories
            </h3>
            <p className="text-sm text-muted-foreground">Choose your vibe — optimized for stories (1080x1920)</p>
          </div>
          <Icon name="Instagram" size={28} color="var(--color-accent)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => generateScreenshot('gradient')}
            loading={isGenerating && template === 'gradient'}
            disabled={isGenerating}
            iconName="Sparkles"
            variant="outline"
            size="lg"
            fullWidth
            className="border-accent/40 hover:bg-accent/10"
          >
            Gradient Vibes
          </Button>
          <Button
            onClick={() => generateScreenshot('minimal')}
            loading={isGenerating && template === 'minimal'}
            disabled={isGenerating}
            iconName="Minus"
            variant="outline"
            size="lg"
            fullWidth
            className="border-accent/40 hover:bg-accent/10"
          >
            Minimal Clean
          </Button>
          <Button
            onClick={() => generateScreenshot('bold')}
            loading={isGenerating && template === 'bold'}
            disabled={isGenerating}
            iconName="Zap"
            variant="outline"
            size="lg"
            fullWidth
            className="border-accent/40 hover:bg-accent/10"
          >
            Bold Impact
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Icon name="Lock" size={14} color="var(--color-accent)" />
          <p>Personal data hidden • Story-ready • 1080x1920px</p>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotShareMode;