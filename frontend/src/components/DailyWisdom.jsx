import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Quote, Sparkles, Brain } from 'lucide-react';

const WISDOM_DATA = [
    { type: 'quote', text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { type: 'fact', text: "A day on Venus is longer than a year on Venus." },
    { type: 'quote', text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
    { type: 'fact', text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible." },
    { type: 'quote', text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { type: 'fact', text: "The human brain generates about 20 watts of electricity at any given time." },
    { type: 'quote', text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { type: 'fact', text: "Octopuses have three hearts and blue blood." },
    { type: 'quote', text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { type: 'fact', text: "There are more trees on Earth than stars in the Milky Way galaxy." },
    { type: 'quote', text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { type: 'fact', text: "Hot water will turn into ice faster than cold water (the Mpemba effect)." },
    { type: 'quote', text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { type: 'fact', text: "A bolt of lightning contains enough energy to toast 100,000 slices of bread." },
    { type: 'quote', text: "Great things never come from comfort zones.", author: "Unknown" },
    { type: 'fact', text: "Bananas are curved because they grow towards the sun." },
    { type: 'quote', text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { type: 'fact', text: "Wombat poop is cube-shaped." },
    { type: 'quote', text: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
    { type: 'fact', text: "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion." },
    { type: 'quote', text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
    { type: 'fact', text: "A group of flamingos is called a 'flamboyance'." },
    { type: 'quote', text: "Dream bigger. Do bigger.", author: "Unknown" },
    { type: 'fact', text: "Sharks have been around longer than trees." },
    { type: 'quote', text: "Don’t stop when you’re tired. Stop when you’re done.", author: "Unknown" },
    { type: 'fact', text: "Ants never sleep. They also don't have lungs." },
    { type: 'quote', text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { type: 'fact', text: "The shortest war in history lasted 38 minutes." },
    { type: 'quote', text: "Do something today that your future self will thank you for.", author: "Unknown" },
    { type: 'fact', text: "Sloths can hold their breath longer than dolphins (up to 40 minutes)." },
    { type: 'quote', text: "Little things make big days.", author: "Unknown" },
    { type: 'fact', text: "An ostrich's eye is bigger than its brain." },
    { type: 'quote', text: "It’s going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { type: 'fact', text: "Tigers have striped skin, not just striped fur." },
    { type: 'quote', text: "Don’t wait for opportunity. Create it.", author: "Unknown" },
    { type: 'fact', text: "A single cloud can weigh more than a million pounds." },
    { type: 'quote', text: "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
    { type: 'fact', text: "The total weight of all the ants on Earth is greater than the total weight of all the humans." },
    { type: 'quote', text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
    { type: 'fact', text: "Cows have best friends and get stressed when they are separated." },
    { type: 'quote', text: "Dream it. Believe it. Build it.", author: "Unknown" },
    { type: 'fact', text: "Hawaii moves 7.5cm closer to Alaska every year." },
    { type: 'quote', text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { type: 'fact', text: "The strongest muscle in the body is the tongue (relative to size)." },
    { type: 'quote', text: "Failure is the opportunity to begin again more intelligently.", author: "Henry Ford" },
    { type: 'fact', text: "A snail can sleep for three years." },
    { type: 'quote', text: "Don't count the days, make the days count.", author: "Unknown" },
    { type: 'fact', text: "Butterflies taste with their feet." },
    { type: 'quote', text: "Genius is 1% inspiration, 99% perspiration.", author: "Thomas Edison" },
    { type: 'fact', text: "Cats can make over 100 vocal sounds; dogs only about 10." }
];

const DailyWisdom = () => {
    const wisdom = useMemo(() => {
        // Create a stable daily seed based on the date in India (IST)
        const now = new Date();
        const indianTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const indianDate = new Date(indianTimeStr);

        const startOfYear = new Date(indianDate.getFullYear(), 0, 0);
        const diff = indianDate - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Use the day of year to pick an index
        const index = dayOfYear % WISDOM_DATA.length;
        return WISDOM_DATA[index];
    }, []);

    const isQuote = wisdom.type === 'quote';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className=" bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
        >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${isQuote ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                        {isQuote ? (
                            <Quote className={`h-5 w-5 ${isQuote ? 'text-indigo-400' : 'text-emerald-400'}`} />
                        ) : (
                            <Lightbulb className={`h-5 w-5 ${isQuote ? 'text-indigo-400' : 'text-emerald-400'}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">
                            {isQuote ? 'Quote of the Day' : 'Did You Know?'}
                        </h3>
                        <p className="text-gray-400 text-xs text-opacity-80">
                            Daily dose of {isQuote ? 'inspiration' : 'knowledge'}
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative">
                    <Quote className="absolute top-2 left-2 h-4 w-4 text-white/10 rotate-180" />

                    <p className={`text-white/90 text-sm leading-relaxed text-center font-medium italic px-2 py-1`}>
                        "{wisdom.text}"
                    </p>

                    {isQuote && (
                        <p className="text-right text-xs text-gray-400 mt-3 font-semibold">
                            — {wisdom.author}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        New wisdom daily
                    </span>
                    <span>#{new Date().toLocaleDateString('en-US', { weekday: 'long' })}Wisdom</span>
                </div>
            </div>
        </motion.div>
    );
};

export default DailyWisdom;
