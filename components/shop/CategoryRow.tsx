import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ShopCategory } from '../../constants/items';
import { ItemCard } from './ItemCard';
import { COLORS, FONT, SPACING } from '../../constants/theme';

interface CategoryRowProps {
  category: ShopCategory;
}

export function CategoryRow({ category }: CategoryRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.title}</Text>
        <Text style={styles.count}>{category.items.length} items</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {category.items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  count: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
});
