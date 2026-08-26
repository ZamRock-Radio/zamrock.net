/* GED vs Diploma — Chart.js visualizations */
/* global Chart */

(function () {
  'use strict';

  // Theme colors
  const COLORS = {
    ged: '#e8734a',
    diploma: '#f2c14e',
    dropout: '#6b7280',
    text: '#f2f2f2',
    dim: 'rgba(242, 242, 242, 0.5)',
    grid: 'rgba(255, 255, 255, 0.08)',
    gedBg: 'rgba(232, 115, 74, 0.85)',
    diplomaBg: 'rgba(242, 193, 78, 0.85)',
    dropoutBg: 'rgba(107, 114, 128, 0.85)'
  };

  Chart.defaults.color = COLORS.dim;
  Chart.defaults.borderColor = COLORS.grid;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

  function barOpts(titleText) {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { font: { size: 12 }, padding: 16 }
        },
        title: {
          display: true,
          text: titleText,
          color: COLORS.text,
          font: { family: "'JetBrains Mono', monospace", size: 13, weight: '600' },
          padding: { bottom: 20 }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: COLORS.grid },
          ticks: { font: { size: 11 } }
        }
      }
    };
  }

  // --- Chart 1: Weekly Earnings ---
  new Chart(document.getElementById('earningsChart'), {
    type: 'bar',
    data: {
      labels: ['Less than HS Diploma', 'GED Holder', 'HS Diploma'],
      datasets: [{
        label: 'Median Weekly Earnings ($)',
        data: [738, 860, 930],
        backgroundColor: [COLORS.dropoutBg, COLORS.gedBg, COLORS.diplomaBg],
        borderColor: [COLORS.dropout, COLORS.ged, COLORS.diploma],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      ...barOpts('Median Weekly Earnings (BLS 2024)'),
      scales: {
        ...barOpts('').scales,
        y: {
          ...barOpts('').scales.y,
          beginAtZero: true,
          ticks: {
            ...barOpts('').scales.y.ticks,
            callback: function (v) { return '$' + v; }
          }
        }
      },
      plugins: {
        ...barOpts('').plugins,
        tooltip: {
          callbacks: {
            label: function (ctx) { return '$' + ctx.raw + '/week'; }
          }
        }
      }
    }
  });

  // --- Chart 2: Employment Rates ---
  new Chart(document.getElementById('employmentChart'), {
    type: 'bar',
    data: {
      labels: ['Full-Time Employment', 'Unemployment Rate'],
      datasets: [
        {
          label: 'GED Holder',
          data: [52, 9],
          backgroundColor: COLORS.gedBg,
          borderColor: COLORS.ged,
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'HS Diploma',
          data: [70, 4],
          backgroundColor: COLORS.diplomaBg,
          borderColor: COLORS.diploma,
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      ...barOpts('Employment Rates (NAAL / LINCS-CPS)'),
      scales: {
        ...barOpts('').scales,
        y: {
          ...barOpts('').scales.y,
          beginAtZero: true,
          ticks: {
            ...barOpts('').scales.y.ticks,
            callback: function (v) { return v + '%'; }
          }
        }
      },
      plugins: {
        ...barOpts('').plugins,
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.dataset.label + ': ' + ctx.raw + '%'; }
          }
        }
      }
    }
  });

  // --- Chart 3: College Enrollment & Degree ---
  new Chart(document.getElementById('collegeChart'), {
    type: 'bar',
    data: {
      labels: ['College Enrollment\n(Ages 18-29)', 'College Degree\n(Ages 25-29)'],
      datasets: [
        {
          label: 'GED Holder',
          data: [17, 3.7],
          backgroundColor: COLORS.gedBg,
          borderColor: COLORS.ged,
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'HS Diploma',
          data: [34, 43.7],
          backgroundColor: COLORS.diplomaBg,
          borderColor: COLORS.diploma,
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      ...barOpts('College Outcomes (NLSY97 / CPS 2009-2010)'),
      scales: {
        ...barOpts('').scales,
        y: {
          ...barOpts('').scales.y,
          beginAtZero: true,
          ticks: {
            ...barOpts('').scales.y.ticks,
            callback: function (v) { return v + '%'; }
          }
        }
      },
      plugins: {
        ...barOpts('').plugins,
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.dataset.label + ': ' + ctx.raw + '%'; }
          }
        }
      }
    }
  });

  // --- Chart 4: Hourly Wage Comparison ---
  new Chart(document.getElementById('wageGapChart'), {
    type: 'bar',
    data: {
      labels: ['Hourly Wage', 'Annual Wage Income', 'Family Income'],
      datasets: [
        {
          label: 'Dropout',
          data: [12.33, 18963, 31553],
          backgroundColor: COLORS.dropoutBg,
          borderColor: COLORS.dropout,
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'GED Holder',
          data: [14.08, 21694, 43767],
          backgroundColor: COLORS.gedBg,
          borderColor: COLORS.ged,
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: 'HS Diploma',
          data: [14.67, 25714, 55077],
          backgroundColor: COLORS.diplomaBg,
          borderColor: COLORS.diploma,
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    },
    options: {
      ...barOpts('Income Comparison — NLSY97 (2008 dollars)'),
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: COLORS.grid },
          ticks: {
            font: { size: 11 },
            callback: function (v) {
              if (v > 1000) return '$' + (v / 1000).toFixed(0) + 'k';
              return '$' + v;
            }
          }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      },
      plugins: {
        ...barOpts('').plugins,
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var val = ctx.raw;
              if (val > 1000) return ctx.dataset.label + ': $' + val.toLocaleString();
              return ctx.dataset.label + ': $' + val;
            }
          }
        }
      }
    }
  });
})();
