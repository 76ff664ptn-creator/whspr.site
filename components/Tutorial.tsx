import React from 'react';

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl shadow-xl shadow-black/40 max-w-2xl w-full p-8 border border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center">Welcome to whspr</h2>
        
        {/* Browse Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Browse what's around you</h3>
          <div className="space-y-3">
            <div className="flex gap-4 items-start">
              <div className="text-3xl flex-shrink-0">🔥</div>
              <div>
                <p className="font-medium">Choose what's hot</p>
                <p className="text-sm text-slate-400">Discover trending posts in your area</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="text-3xl flex-shrink-0">❄️</div>
              <div>
                <p className="font-medium">Or change your mind</p>
                <p className="text-sm text-slate-400">Explore cooler, older conversations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contribute Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Add your grain of salt</h3>
          <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">💭</div>
            <div>
              <p className="font-medium">Reply to topics</p>
              <p className="text-sm text-slate-400">or create your very own</p>
            </div>
          </div>
        </div>

        {/* How Posts Are Categorized */}
        <div className="mb-8 bg-slate-700/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-5 text-slate-200">Posts are categorized by</h3>
          
          <div className="space-y-5">
            {/* Heat */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-sm">Heat</p>
                <p className="text-xs text-slate-400">How active</p>
              </div>
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-orange-500" style={{width: '65%'}}></div>
              </div>
            </div>

            {/* Proximity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-sm">Proximity</p>
                <p className="text-xs text-slate-400">How close</p>
              </div>
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{width: '45%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Persistence Section */}
        <div className="mb-8">
          <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">🔒</div>
            <div>
              <p className="font-medium">Keep conversations alive</p>
              <p className="text-sm text-slate-400">Your posts are deleted when you leave, unless you decide otherwise—lock them to keep other people's minds busy</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onComplete}
          className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-medium p-4 rounded-3xl"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
