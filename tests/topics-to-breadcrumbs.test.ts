import { topicsToBreadcrumbs } from '../src/shared/utils/topics-to-breadcrumbs';
import { Breadcrumb } from '../src/shared/interfaces/breadcrumb';
import { NestedTopic } from '../src/shared/utils/nested-topics';
import { Locale } from '../src/shared/enums/locale';

describe('topicsToBreadcrumbs', () => {
  it('should return an empty array when given an empty input', () => {
    const input: NestedTopic[] = [];
    const expectedOutput: Breadcrumb[][] = [];

    const result = topicsToBreadcrumbs(input, Locale.EnglishGb);
    expect(result).toEqual(expectedOutput);
  });

  it('should provide a separate breadcrumb path per leaf topic for the same root topic', () => {
    const input: NestedTopic[] = [
      {
        id: 1,
        path: '1',
        name: 'Business, economy and labour market',
        children: [
          { id: 2, path: '1.2', name: 'Business', children: [] },
          { id: 4, path: '1.4', name: 'Employment', children: [] },
          { id: 7, path: '1.7', name: 'Research and development', children: [] }
        ]
      }
    ];

    const expectedOutput: Breadcrumb[][] = [
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '2', label: 'Business', url: '/en-GB/topic/2/business' }
      ],
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '4', label: 'Employment', url: '/en-GB/topic/4/employment' }
      ],
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '7', label: 'Research and development', url: '/en-GB/topic/7/research-and-development' }
      ]
    ];

    const result = topicsToBreadcrumbs(input, Locale.EnglishGb);
    expect(result).toEqual(expectedOutput);
  });

  it('should provide a separate breadcrumb path per leaf topic for different root topics', () => {
    const input: NestedTopic[] = [
      {
        id: 1,
        path: '1',
        name: 'Business, economy and labour market',
        children: [{ id: 7, path: '1.7', name: 'Research and development', children: [] }]
      },
      {
        id: 32,
        path: '32',
        name: 'Finance and tax',
        children: [{ id: 39, path: '32.39', name: 'Settlement', children: [] }]
      },
      {
        id: 86,
        path: '86',
        name: 'Poverty',
        children: [{ id: 90, path: '86.90', name: 'Income poverty', children: [] }]
      }
    ];

    const expectedOutput: Breadcrumb[][] = [
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '7', label: 'Research and development', url: '/en-GB/topic/7/research-and-development' }
      ],
      [
        {
          id: '32',
          label: 'Finance and tax',
          url: '/en-GB/topic/32/finance-and-tax'
        },
        { id: '39', label: 'Settlement', url: '/en-GB/topic/39/settlement' }
      ],
      [
        {
          id: '86',
          label: 'Poverty',
          url: '/en-GB/topic/86/poverty'
        },
        { id: '90', label: 'Income poverty', url: '/en-GB/topic/90/income-poverty' }
      ]
    ];

    const result = topicsToBreadcrumbs(input, Locale.EnglishGb);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle deeply nested topics', () => {
    const input: NestedTopic[] = [
      {
        id: 1,
        path: '1',
        name: 'Business, economy and labour market',
        children: [
          {
            id: 2,
            path: '1.2',
            name: 'Business',
            children: [
              {
                id: 3,
                path: '1.2.3',
                name: 'Small businesses',
                children: [{ id: 5, path: '1.2.3.5', name: 'Lemonade stand', children: [] }]
              }
            ]
          },
          { id: 4, path: '1.4', name: 'Employment', children: [] },
          { id: 7, path: '1.7', name: 'Research and development', children: [] }
        ]
      }
    ];

    const expectedOutput: Breadcrumb[][] = [
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '2', label: 'Business', url: '/en-GB/topic/2/business' },
        { id: '3', label: 'Small businesses', url: '/en-GB/topic/3/small-businesses' },
        { id: '5', label: 'Lemonade stand', url: '/en-GB/topic/5/lemonade-stand' }
      ],
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '4', label: 'Employment', url: '/en-GB/topic/4/employment' }
      ],
      [
        {
          id: '1',
          label: 'Business, economy and labour market',
          url: '/en-GB/topic/1/business-economy-and-labour-market'
        },
        { id: '7', label: 'Research and development', url: '/en-GB/topic/7/research-and-development' }
      ]
    ];

    const result = topicsToBreadcrumbs(input, Locale.EnglishGb);
    expect(result).toEqual(expectedOutput);
  });
});
