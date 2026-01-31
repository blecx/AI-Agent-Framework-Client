/**
 * Test Data Builders - Single Responsibility: Test Data Generation
 * Provides fluent builders for creating test data
 */

import { RAIDItemData } from './raid-api-client';

export class RAIDItemBuilder {
  private data: RAIDItemData = {
    type: 'risk',
    title: 'Default Test Item',
    description: 'Default description',
  };

  withType(type: 'risk' | 'assumption' | 'issue' | 'dependency'): this {
    this.data.type = type;
    return this;
  }

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withPriority(priority: string): this {
    this.data.priority = priority;
    return this;
  }

  withStatus(status: string): this {
    this.data.status = status;
    return this;
  }

  withOwner(owner: string): this {
    this.data.owner = owner;
    return this;
  }

  build(): RAIDItemData {
    return { ...this.data };
  }

  /**
   * Create multiple items with a common pattern
   */
  static buildMany(
    count: number,
    customizer?: (builder: RAIDItemBuilder, index: number) => void,
  ): RAIDItemData[] {
    const items: RAIDItemData[] = [];
    
    for (let i = 0; i < count; i++) {
      const builder = new RAIDItemBuilder();
      builder.withTitle(`Test Item ${i + 1}`);
      builder.withDescription(`Description for item ${i + 1}`);
      
      if (customizer) {
        customizer(builder, i);
      }
      
      items.push(builder.build());
    }
    
    return items;
  }

  /**
   * Create items with varied types for testing
   */
  static buildVariedTypes(count: number): RAIDItemData[] {
    const types: Array<'risk' | 'assumption' | 'issue' | 'dependency'> = [
      'risk',
      'assumption',
      'issue',
      'dependency',
    ];

    return this.buildMany(count, (builder, index) => {
      const type = types[index % types.length];
      builder.withType(type);
      builder.withTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`);
    });
  }

  /**
   * Create items with varied priorities for testing
   */
  static buildVariedPriorities(count: number): RAIDItemData[] {
    const priorities = ['low', 'medium', 'high', 'critical'];

    return this.buildMany(count, (builder, index) => {
      const priority = priorities[index % priorities.length];
      builder.withPriority(priority);
    });
  }
}
