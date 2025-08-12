import React from 'react';
import FooterSection from './FooterSection';
import { ContactInfo, SocialLink } from '../types';

// 联系信息项组件
const ContactItem: React.FC<{ item: ContactInfo }> = ({ item }) => {
  const content = (
    <div className="contact-item flex items-start gap-3">
      {item.icon && (
        <span className="contact-icon text-amber-400 mt-1 flex-shrink-0">
          {item.icon}
        </span>
      )}
      <div className="contact-content">
        <div className="contact-label text-sm text-gray-400 font-medium">
          {item.label}
        </div>
        <div className="contact-value text-gray-300">
          {item.link ? (
            <a 
              href={item.link}
              className="hover:text-amber-400 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.value}
            </a>
          ) : (
            item.value
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="contact-item-wrapper py-2">
      {content}
    </div>
  );
};

// 社交媒体链接组件
const SocialLinks: React.FC<{ links: SocialLink[] }> = ({ links }) => {
  return (
    <div className="social-links">
      <h4 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wide">
        关注我们
      </h4>
      <div className="social-links-grid flex gap-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link w-10 h-10 rounded-full bg-gray-700 hover:bg-amber-500 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label={link.ariaLabel}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

// 联系区域组件
const ContactSection: React.FC<{ 
  items: ContactInfo[]; 
  socialLinks?: SocialLink[];
}> = ({ items, socialLinks }) => {
  return (
    <FooterSection title="联系我们">
      <div className="contact-content space-y-1">
        {items.map((item, index) => (
          <ContactItem key={index} item={item} />
        ))}
        
        {socialLinks && socialLinks.length > 0 && (
          <div className="social-links-wrapper mt-6">
            <SocialLinks links={socialLinks} />
          </div>
        )}
      </div>
    </FooterSection>
  );
};

export default ContactSection;