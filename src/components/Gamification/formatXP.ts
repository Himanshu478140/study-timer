/**
 * Formats XP numbers into a compact readable string (e.g. 1,225 XP, 12.5K XP, 157K XP, 1.25M XP, 8.4B XP).
 */
export const formatXP = (xp: number): string => {
    const sign = xp < 0 ? '-' : '';
    const val = Math.abs(xp);

    if (val < 10000) {
        return `${sign}${val.toLocaleString()} XP`;
    }

    if (val < 99950) {
        // 10K to 99.9K (1 decimal place)
        const num = val / 1000;
        const formatted = num.toFixed(1).replace(/\.0$/, '');
        return `${sign}${formatted}K XP`;
    }

    if (val < 999500) {
        // 100K to 999K (rounded whole thousands)
        const thousands = Math.round(val / 1000);
        if (thousands >= 1000) {
            return `${sign}1M XP`;
        }
        return `${sign}${thousands}K XP`;
    }

    if (val < 999500000) {
        // 1M to 999.99M (up to 2 decimal places)
        const millions = val / 1000000;
        const formatted = parseFloat(millions.toFixed(2));
        if (formatted >= 1000) {
            return `${sign}1B XP`;
        }
        return `${sign}${formatted}M XP`;
    }

    // 1B+
    const billions = val / 1000000000;
    const formatted = parseFloat(billions.toFixed(2));
    return `${sign}${formatted}B XP`;
};
