import { useState, useEffect } from 'react';

// Custom hook to fetch and cache site content
export const useSiteContent = (section = null) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                
                // Try to get content from public endpoint first
                const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
                const response = await fetch(`${baseUrl}/api/site-content`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setContent(section ? data.data[section] : data.data);
                    } else {
                        // Fallback to default content
                        setContent(getDefaultContent(section));
                    }
                } else {
                    // Fallback to default content
                    setContent(getDefaultContent(section));
                }
            } catch (err) {
                console.warn('Failed to fetch site content, using defaults:', err);
                setContent(getDefaultContent(section));
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
        
        // Return fetchContent for manual refetch
        return fetchContent;
    }, [section]);

    const refetch = async () => {
        try {
            setLoading(true);
            
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            const response = await fetch(`${baseUrl}/api/site-content`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setContent(section ? data.data[section] : data.data);
                }
            }
        } catch (err) {
            console.warn('Failed to refetch site content:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { content, loading, error, refetch };
};

// Default content fallbacks
const getDefaultContent = (section) => {
    const defaultContent = {
        errorPage: {
            title: "404",
            heading: "Oops! Page Not Found",
            description: "The page you're looking for doesn't exist or has been moved.",
            quickLinks: [
                { label: "Help Center", path: "/help-center" },
                { label: "Contact Us", path: "/contact-us" },
                { label: "Track Order", path: "/track-order" },
                { label: "Returns", path: "/returns-refunds" }
            ]
        },
        contactUs: {
            title: "Contact Us",
            subtitle: "We're here to help! Get in touch with our team for any questions, support, or feedback.",
            businessInfo: {
                address: "123 E-Commerce Street\nBusiness District\nCity, State 12345",
                phone: "+1 (555) 123-4567",
                email: "support@ashamsmart.com",
                hours: "Mon-Fri 9am-6pm"
            },
            responseInfo: {
                emailResponse: "24-48 hours",
                phoneHours: "Mon-Fri 9AM-6PM",
                liveChatHours: "Mon-Fri 9AM-6PM"
            }
        },
        siteSettings: {
            siteName: "AshAmSmart",
            siteDescription: "Your trusted e-commerce marketplace for quality products",
            supportEmail: "support@ashamsmart.com",
            maintenanceMode: false
        }
    };

    return section ? defaultContent[section] : defaultContent;
};

export default useSiteContent;
