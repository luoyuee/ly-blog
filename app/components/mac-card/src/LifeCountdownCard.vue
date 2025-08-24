<script setup>
import { reactive } from "vue";
import MacCard from "./MacCard.vue";
import numeral from "numeral";
import dayjs from "dayjs";

const countdown = reactive({
  hour: 0,
  hourPercent: "0%",
  week: 0,
  weekPercent: "0%",
  date: 0,
  datePercent: "0%",
  month: 0,
  monthPercent: "0%"
});

onMounted(() => {
  const now = dayjs();

  countdown.hour = now.hour();
  countdown.hourPercent = numeral(countdown.hour).divide(24).format("0%");

  countdown.week = now.day() > 0 ? now.day() : 7;
  countdown.weekPercent = numeral(countdown.week).divide(7).format("0%");

  countdown.date = now.date();
  countdown.datePercent = numeral(countdown.date).divide(now.daysInMonth()).format("0%");

  countdown.month = now.month() + 1;
  countdown.monthPercent = numeral(countdown.month).divide(12).format("0%");
});
</script>
<template>
  <MacCard :title="$t('components.lifeCountdownCard.title')">
    <div class="life-countdown">
      <div class="item">
        <div class="title">
          {{ $t("components.lifeCountdownCard.today.before") }}
          <span class="text">{{ countdown.hour }}</span>
          {{ $t("components.lifeCountdownCard.today.after") }}
        </div>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-bar-inner blue" :style="`width:${countdown.hourPercent}`"></div>
          </div>
          <div class="progress-percentage">{{ countdown.hourPercent }}</div>
        </div>
      </div>
      <div class="item">
        <div class="title">
          {{ $t("components.lifeCountdownCard.week.before") }}
          <span class="text">{{ countdown.week }}</span>
          {{ $t("components.lifeCountdownCard.week.after") }}
        </div>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-bar-inner yellow" :style="`width:${countdown.weekPercent}`"></div>
          </div>
          <div class="progress-percentage">{{ countdown.weekPercent }}</div>
        </div>
      </div>
      <div class="item">
        <div class="title">
          {{ $t("components.lifeCountdownCard.month.before") }}
          <span class="text">{{ countdown.date }}</span>
          {{ $t("components.lifeCountdownCard.month.after") }}
        </div>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-bar-inner red" :style="`width:${countdown.datePercent}`"></div>
          </div>
          <div class="progress-percentage">{{ countdown.datePercent }}</div>
        </div>
      </div>
      <div class="item">
        <div class="title">
          {{ $t("components.lifeCountdownCard.year.before") }}
          <span class="text">{{ countdown.month }}</span>
          {{ $t("components.lifeCountdownCard.year.after") }}
        </div>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-bar-inner green" :style="`width:${countdown.monthPercent}`"></div>
          </div>
          <div class="progress-percentage">{{ countdown.monthPercent }}</div>
        </div>
      </div>
    </div>
  </MacCard>
</template>
<style scoped lang="scss">
.life-countdown {
  .item {
    margin-bottom: 16px;
    .title {
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      justify-content: flex-start;
      .text {
        padding: 0 4px;
        font-size: 1rem;
      }
    }
    .progress {
      display: flex;
      align-items: center;
      .progress-bar {
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        width: 0;
        min-width: 0;
        flex: 1;
        margin-right: 5px;
        .progress-bar-inner {
          height: 100%;
          border-radius: 5px;
          transition: width 0.35s;
          animation: progress 3s linear infinite;
        }
        @keyframes progress {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 30px 0;
          }
        }
        .progress-bar-inner.blue {
          background: #bde6ff;
          background-image: linear-gradient(
            135deg,
            #50bfff 25%,
            transparent 25%,
            transparent 50%,
            #50bfff 50%,
            #50bfff 75%,
            transparent 75%,
            transparent 100%
          );
          background-size: 30px 30px;
        }
        .progress-bar-inner.yellow {
          background: #ffd980;
          background-image: linear-gradient(
            135deg,
            #f7ba2a 25%,
            transparent 25%,
            transparent 50%,
            #f7ba2a 50%,
            #f7ba2a 75%,
            transparent 75%,
            transparent 100%
          );
          background-size: 30px 30px;
        }

        .progress-bar-inner.red {
          background: #ffa9a9;
          background-image: linear-gradient(
            135deg,
            #ff4949 25%,
            transparent 25%,
            transparent 50%,
            #ff4949 50%,
            #ff4949 75%,
            transparent 75%,
            transparent 100%
          );
          background-size: 30px 30px;
        }
        .progress-bar-inner.green {
          background: #89d165;
          background-image: linear-gradient(
            135deg,
            #68b942 25%,
            transparent 25%,
            transparent 50%,
            #68b942 50%,
            #68b942 75%,
            transparent 75%,
            transparent 100%
          );
          background-size: 30px 30px;
        }
      }
      .progress-percentage {
        font-size: 0.875rem;
      }
    }
  }
  .item:last-child {
    margin-bottom: 0;
  }
}
</style>
