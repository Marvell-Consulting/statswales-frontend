import { topicsToBreadcrumbs } from '../src/shared/utils/topics-to-breadcrumbs';
import { Breadcrumb } from '../src/shared/interfaces/breadcrumb';
import { NestedTopic } from '../src/shared/utils/nested-topics';
import { Locale } from '../src/shared/enums/locale';

describe('topicsToBreadcrumbs', () => {
  it('should convert nested topics to breadcrumb paths', () => {
    const input: NestedTopic[] = [
      {
        id: 1,
        path: '1',
        name: 'Business, economy and labour market',
        children: [
          { id: 2, path: '1.2', name: 'Business', children: [] },
          { id: 4, path: '1.4', name: 'Employment', children: [] },
          {
            id: 7,
            path: '1.7',
            name: 'Research and development',
            children: []
          }
        ]
      }
    ];

    const result = topicsToBreadcrumbs(input, Locale.EnglishGb);

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

    expect(result).toEqual(expectedOutput);
  });
});
