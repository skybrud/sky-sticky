<script>
import SkyScroll from 'SkyScroll';

export default {
	props: {
		offset: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			isSticky: false,
			bottomReached: false,
			stickyHeight: null,
			skyStickyTop: null,
		};
	},
	computed: {
		styleObject() {
			return this.isSticky && !this.bottomReached
				? { top: `${this.offset}px` }
				: null;
		},
	},
	mounted() {
		this.$set(this, 'stickyHeight', this.$refs.sticky.getBoundingClientRect().height);

		SkyScroll.track(
			this.$el,
			(scrolled, dimensions, viewport) => {
				if (this.stickyHeight < dimensions.height) {
					this.isSticky =
						viewport.scroll.y
						>= (dimensions.top - this.offset);

					this.bottomReached =
						viewport.scroll.y
						>= (dimensions.bottom - this.stickyHeight - this.offset);
				} else {
					this.isSticky = false;
					this.bottomReached = false;
				}
			},
			{
				onResize: () => {
					this.$set(this, 'stickyHeight', this.$refs.sticky.getBoundingClientRect().height);
				},
			},
		);
	},
	beforeDestroy() {
		SkyScroll.untrack(this.$el);
	},
};
</script>
<style>
	.sky-sticky {
		position: relative;

		&.active {}
	}

	.sticky {
		position: relative;

		&.stick {
			position: fixed;

			&.stop {
				position: absolute;
				bottom: 0;
			}
		}
	}
</style>
<template>
	<div
		:class="['sky-sticky', { active: isSticky }]"
		:style="{ 'min-height': `${stickyHeight}px` }"
	>
		<div
			:class="['sticky', { stick: isSticky }, { stop: bottomReached }]"
			:style="styleObject"
			ref="sticky"
		>
			<slot />
		</div>
	</div>
</template>