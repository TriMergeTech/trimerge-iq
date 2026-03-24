import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ServiceCard {
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly services: ServiceCard[] = [
    {
      title: 'Strategy Consulting',
      description:
        'Transform your business with data-driven strategies and actionable insights.',
      color: '#1e5ba8',
    },
    {
      title: 'Digital Transformation',
      description:
        'Navigate the digital landscape with technology solutions built for modern teams.',
      color: '#d4af37',
    },
    {
      title: 'Operational Excellence',
      description:
        'Optimize processes and maximize efficiency across your organization.',
      color: '#808080',
    },
  ];

  readonly stats: Stat[] = [
    { value: '500+', label: 'Clients Served' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '25+', label: 'Years Experience' },
    { value: '150+', label: 'Expert Consultants' },
  ];
}
