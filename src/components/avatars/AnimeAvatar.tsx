'use client';

interface AnimeAvatarProps {
  type: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AnimeAvatar({ type, size = 'md', className = '' }: AnimeAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const renderAvatar = () => {
    switch (type) {
      case 'cat':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Cat face */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-3 h-3 bg-orange-400 rounded-full transform rotate-12"></div>
              <div className="absolute -top-1 right-1 w-3 h-3 bg-orange-400 rounded-full transform -rotate-12"></div>
              {/* Inner ears */}
              <div className="absolute top-0 left-1.5 w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
              <div className="absolute top-0 right-1.5 w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-1 border-b-2 border-black rounded-full"></div>
              </div>
              {/* Whiskers */}
              <div className="absolute top-4 left-0 w-2 h-0.5 bg-black rounded-full"></div>
              <div className="absolute top-5 left-0 w-2 h-0.5 bg-black rounded-full"></div>
              <div className="absolute top-4 right-0 w-2 h-0.5 bg-black rounded-full"></div>
              <div className="absolute top-5 right-0 w-2 h-0.5 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'dog':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Dog face */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-2.5 h-4 bg-yellow-400 rounded-full transform rotate-12"></div>
              <div className="absolute -top-1 right-1 w-2.5 h-4 bg-yellow-400 rounded-full transform -rotate-12"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'bunny':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Bunny face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-2 left-1 w-1.5 h-4 bg-gray-300 rounded-full transform rotate-12"></div>
              <div className="absolute -top-2 right-1 w-1.5 h-4 bg-gray-300 rounded-full transform -rotate-12"></div>
              {/* Inner ears */}
              <div className="absolute -top-1 left-1.5 w-0.5 h-3 bg-pink-300 rounded-full"></div>
              <div className="absolute -top-1 right-1.5 w-0.5 h-3 bg-pink-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'fox':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Fox face */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-2.5 h-3 bg-orange-500 rounded-full transform rotate-12"></div>
              <div className="absolute -top-1 right-1 w-2.5 h-3 bg-orange-500 rounded-full transform -rotate-12"></div>
              {/* Inner ears */}
              <div className="absolute top-0 left-1.5 w-1 h-1.5 bg-orange-600 rounded-full"></div>
              <div className="absolute top-0 right-1.5 w-1 h-1.5 bg-orange-600 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'bear':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Bear face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-3 h-3 bg-amber-700 rounded-full"></div>
              <div className="absolute -top-1 right-1 w-3 h-3 bg-amber-700 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-0 left-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              <div className="absolute top-0 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'panda':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Panda face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute -top-1 left-1 w-3 h-3 bg-black rounded-full"></div>
              <div className="absolute -top-1 right-1 w-3 h-3 bg-black rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-2 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3.5 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3.5 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'owl':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Owl face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-lg">
              {/* Eyes */}
              <div className="absolute top-2 left-1.5 w-2.5 h-3 bg-black rounded-full"></div>
              <div className="absolute top-2 right-1.5 w-2.5 h-3 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-2.5 left-2 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-2.5 right-2 w-1 h-1 bg-white rounded-full"></div>
              {/* Beak */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
              {/* Wings */}
              <div className="absolute top-4 left-0 w-2 h-3 bg-amber-600 rounded-full"></div>
              <div className="absolute top-4 right-0 w-2 h-3 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        );

      case 'penguin':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Penguin face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-full shadow-lg">
              {/* Belly */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Beak */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        );

      case 'frog':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Frog face */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg">
              {/* Eyes */}
              <div className="absolute top-1 left-1 w-2 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute top-1 right-1 w-2 h-3 bg-green-500 rounded-full"></div>
              {/* Eye pupils */}
              <div className="absolute top-2 left-1.5 w-1 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-2 right-1.5 w-1 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-green-700 rounded-full"></div>
            </div>
          </div>
        );

      case 'monkey':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Monkey face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-700 rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'lion':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Lion face */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
              {/* Mane */}
              <div className="absolute -top-2 left-0 w-full h-4 bg-orange-600 rounded-full"></div>
              {/* Ears */}
              <div className="absolute top-0 left-2 w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-4 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-4 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-4 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-4 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'tiger':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Tiger face */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg">
              {/* Stripes */}
              <div className="absolute top-2 left-1 w-1 h-3 bg-black rounded-full transform rotate-12"></div>
              <div className="absolute top-2 right-1 w-1 h-3 bg-black rounded-full transform -rotate-12"></div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-black rounded-full"></div>
              {/* Ears */}
              <div className="absolute top-0 left-2 w-2 h-2 bg-orange-300 rounded-full"></div>
              <div className="absolute top-0 right-2 w-2 h-2 bg-orange-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-4 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-4 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-4 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-4 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'elephant':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Elephant face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-lg">
              {/* Trunk */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gray-400 rounded-full"></div>
              {/* Ears */}
              <div className="absolute top-1 left-0 w-3 h-4 bg-gray-400 rounded-full"></div>
              <div className="absolute top-1 right-0 w-3 h-4 bg-gray-400 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Tusks */}
              <div className="absolute top-5 left-1.5 w-0.5 h-1 bg-white rounded-full"></div>
              <div className="absolute top-5 right-1.5 w-0.5 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        );

      case 'koala':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Koala face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2.5 h-3 bg-gray-500 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2.5 h-3 bg-gray-500 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-1 left-1.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="absolute top-1 right-1.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-4 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-4 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-4 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-4 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'panda-red':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Red panda face */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2.5 h-3 bg-red-500 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2.5 h-3 bg-red-500 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-1 left-1.5 w-1 h-1.5 bg-red-300 rounded-full"></div>
              <div className="absolute top-1 right-1.5 w-1 h-1.5 bg-red-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-4 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-4 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-4 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-4 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'sloth':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Sloth face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg">
              {/* Eyes */}
              <div className="absolute top-3 left-1.5 w-2 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-1.5 w-2 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-black rounded-full"></div>
              {/* Fur marks */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="absolute top-2 right-1 w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        );

      case 'raccoon':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Raccoon face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-lg">
              {/* Mask */}
              <div className="absolute top-2 left-1 w-3 h-2 bg-black rounded-full"></div>
              <div className="absolute top-2 right-1 w-3 h-2 bg-black rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'deer':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Deer face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2 h-3 bg-amber-300 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2 h-3 bg-amber-300 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-1 left-1.5 w-0.5 h-2 bg-amber-100 rounded-full"></div>
              <div className="absolute top-1 right-1.5 w-0.5 h-2 bg-amber-100 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'hamster':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Hamster face */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-0.5 left-1.5 w-0.5 h-1 bg-orange-200 rounded-full"></div>
              <div className="absolute top-0.5 right-1.5 w-0.5 h-1 bg-orange-200 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-black rounded-full"></div>
              {/* Cheeks */}
              <div className="absolute top-4 left-0 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
              <div className="absolute top-4 right-0 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
            </div>
          </div>
        );

      case 'hedgehog':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Hedgehog face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full shadow-lg">
              {/* Spines */}
              <div className="absolute top-0 left-1 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 left-2 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 left-3 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 left-4 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 left-5 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 right-1 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 right-2 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 right-3 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 right-4 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              <div className="absolute top-0 right-5 w-0.5 h-2 bg-gray-600 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-black rounded-full"></div>
            </div>
          </div>
        );

      case 'hippo':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Hippo face */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-1 left-1 w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="absolute top-1 right-1 w-2 h-2 bg-gray-500 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-2 h-1.5 bg-gray-500 rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-600 rounded-full"></div>
              {/* Teeth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded-full"></div>
            </div>
          </div>
        );

      case 'fish':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Fish body */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-red-400 rounded-full shadow-lg">
              {/* Fins */}
              <div className="absolute top-2 left-0 w-1.5 h-2 bg-orange-400 rounded-full transform rotate-12"></div>
              <div className="absolute top-2 right-0 w-1.5 h-2 bg-orange-400 rounded-full transform -rotate-12"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-400 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Scales */}
              <div className="absolute top-4 left-1 w-0.5 h-0.5 bg-orange-200 rounded-full"></div>
              <div className="absolute top-4 right-1 w-0.5 h-0.5 bg-orange-200 rounded-full"></div>
            </div>
          </div>
        );

      case 'dolphin':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Dolphin body */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg">
              {/* Fins */}
              <div className="absolute top-2 left-0 w-1.5 h-2 bg-blue-400 rounded-full transform rotate-12"></div>
              <div className="absolute top-2 right-0 w-1.5 h-2 bg-blue-400 rounded-full transform -rotate-12"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-blue-400 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-blue-600 rounded-full"></div>
              {/* Belly */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-200 rounded-full"></div>
            </div>
          </div>
        );

      case 'duck':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Duck body */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg">
              {/* Beak */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-400 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-2 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-2 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Wings */}
              <div className="absolute top-4 left-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-4 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
              {/* Wing details */}
              <div className="absolute top-4.5 left-0.5 w-1 h-1 bg-yellow-200 rounded-full"></div>
              <div className="absolute top-4.5 right-0.5 w-1 h-1 bg-yellow-200 rounded-full"></div>
            </div>
          </div>
        );

      case 'flamingo':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Flamingo body */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full shadow-lg">
              {/* Beak */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-pink-600 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-2 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-2 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Wings */}
              <div className="absolute top-4 left-0 w-2 h-2 bg-pink-400 rounded-full"></div>
              <div className="absolute top-4 right-0 w-2 h-2 bg-pink-400 rounded-full"></div>
              {/* Wing details */}
              <div className="absolute top-4.5 left-0.5 w-1 h-1 bg-pink-200 rounded-full"></div>
              <div className="absolute top-4.5 right-0.5 w-1 h-1 bg-pink-200 rounded-full"></div>
              {/* Crest */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1.5 bg-pink-600 rounded-full"></div>
            </div>
          </div>
        );

      case 'beaver':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Beaver face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-0.5 left-1.5 w-0.5 h-1 bg-amber-200 rounded-full"></div>
              <div className="absolute top-0.5 right-1.5 w-0.5 h-1 bg-amber-200 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Teeth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white rounded-full"></div>
              <div className="absolute top-6.5 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-orange-300 rounded-full"></div>
            </div>
          </div>
        );

      case 'squirrel':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Squirrel face */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2 h-2.5 bg-amber-400 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2 h-2.5 bg-amber-400 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-0.5 left-1.5 w-0.5 h-1.5 bg-amber-100 rounded-full"></div>
              <div className="absolute top-0.5 right-1.5 w-0.5 h-1.5 bg-amber-100 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 bg-black rounded-full"></div>
              {/* Cheeks */}
              <div className="absolute top-4 left-0 w-1.5 h-1.5 bg-amber-200 rounded-full"></div>
              <div className="absolute top-4 right-0 w-1.5 h-1.5 bg-amber-200 rounded-full"></div>
            </div>
          </div>
        );

      case 'zebra':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Zebra face */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg">
              {/* Ears */}
              <div className="absolute top-0 left-1 w-2.5 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute top-0 right-1 w-2.5 h-3 bg-gray-800 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-1 left-1.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="absolute top-1 right-1.5 w-1 h-1.5 bg-gray-300 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
              {/* Stripes */}
              <div className="absolute top-2 left-1 w-0.5 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute top-2 left-2 w-0.5 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute top-2 right-1 w-0.5 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute top-2 right-2 w-0.5 h-3 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        );

      case 'whale':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Whale body */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg">
              {/* Fins */}
              <div className="absolute top-2 left-0 w-1.5 h-2 bg-blue-500 rounded-full transform rotate-12"></div>
              <div className="absolute top-2 right-0 w-1.5 h-2 bg-blue-500 rounded-full transform -rotate-12"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-blue-500 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-blue-700 rounded-full"></div>
              {/* Belly */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-5 h-2 bg-blue-200 rounded-full"></div>
              {/* Spout */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full"></div>
            </div>
          </div>
        );

      case 'goat':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            {/* Goat face */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg">
              {/* Horns */}
              <div className="absolute top-0 left-1.5 w-0.5 h-2 bg-gray-600 rounded-full transform rotate-12"></div>
              <div className="absolute top-0 right-1.5 w-0.5 h-2 bg-gray-600 rounded-full transform -rotate-12"></div>
              {/* Ears */}
              <div className="absolute top-1 left-1 w-1.5 h-2 bg-gray-300 rounded-full"></div>
              <div className="absolute top-1 right-1 w-1.5 h-2 bg-gray-300 rounded-full"></div>
              {/* Inner ears */}
              <div className="absolute top-1.5 left-1.5 w-0.5 h-1 bg-gray-100 rounded-full"></div>
              <div className="absolute top-1.5 right-1.5 w-0.5 h-1 bg-gray-100 rounded-full"></div>
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-1.5 h-2 bg-black rounded-full"></div>
              <div className="absolute top-3 right-2 w-1.5 h-2 bg-black rounded-full"></div>
              {/* Eye shine */}
              <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              <div className="absolute top-3 right-2.5 w-0.5 h-0.5 bg-white rounded-full"></div>
              {/* Nose */}
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
              {/* Mouth */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
              {/* Beard */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-1.5 bg-gray-400 rounded-full"></div>
              {/* Goatee */}
              <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">?</span>
            </div>
          </div>
        );
    }
  };

  return renderAvatar();
}
