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

  // --- Chart 1: Yearly Earnings ---
  new Chart(document.getElementById('earningsChart'), {
    type: 'bar',
    data: {
      labels: ['Less than HS Diploma', 'GED Holder', 'HS Diploma', 'College Degree'],
      datasets: [{
        label: 'Median Annual Earnings ($)',
        data: [38376, 44720, 48360, 74688],
        backgroundColor: [COLORS.dropoutBg, COLORS.gedBg, COLORS.diplomaBg, 'rgba(129, 140, 248, 0.85)'],
        borderColor: [COLORS.dropout, COLORS.ged, COLORS.diploma, '#818cf8'],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      ...barOpts('Median Annual Earnings — Full-Time Workers (BLS 2024)'),
      scales: {
        ...barOpts('').scales,
        y: {
          ...barOpts('').scales.y,
          beginAtZero: true,
          ticks: {
            ...barOpts('').scales.y.ticks,
            callback: function (v) { return '$' + (v / 1000).toFixed(0) + 'k'; }
          }
        }
      },
      plugins: {
        ...barOpts('').plugins,
        tooltip: {
          callbacks: {
            label: function (ctx) { return '$' + ctx.raw.toLocaleString() + '/year'; }
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
    type: 'line',
    data: {
      labels: ['College Enrollment\n(Ages 18-29)', 'College Degree\n(Ages 25-29)'],
      datasets: [
        {
          label: 'GED Holder',
          data: [17, 3.7],
          borderColor: COLORS.ged,
          backgroundColor: COLORS.gedBg,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: COLORS.ged,
          tension: 0.3
        },
        {
          label: 'HS Diploma',
          data: [34, 43.7],
          borderColor: COLORS.diploma,
          backgroundColor: COLORS.diplomaBg,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: COLORS.diploma,
          tension: 0.3
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

  // --- Chart 5: Health Indicators ---
  new Chart(document.getElementById('healthChart'), {
    type: 'radar',
    data: {
      labels: ['Smoking Rate', 'Obesity', 'Depression', 'Cognitive Impairment', 'No Preventive Care', 'College Degree Attainment'],
      datasets: [
        {
          label: 'HS Dropout',
          data: [29.7, 38, 22, 18, 35, 1],
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          borderColor: COLORS.dropout,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: COLORS.dropout
        },
        {
          label: 'GED Holder',
          data: [44, 38, 22, 18, 35, 3.7],
          backgroundColor: 'rgba(232, 115, 74, 0.2)',
          borderColor: COLORS.ged,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: COLORS.ged
        },
        {
          label: 'HS Diploma',
          data: [22, 28, 14, 10, 20, 43.7],
          backgroundColor: 'rgba(242, 193, 78, 0.2)',
          borderColor: COLORS.diploma,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: COLORS.diploma
        },
        {
          label: 'College Degree',
          data: [8.3, 24, 10, 7, 14, 100],
          backgroundColor: 'rgba(129, 140, 248, 0.2)',
          borderColor: '#818cf8',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#818cf8'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { font: { size: 12 }, padding: 16 }
        },
        title: {
          display: true,
          text: 'Education & Health Outcomes (Zajacova 2012 / NHIS / CDC / NCES)',
          color: COLORS.text,
          font: { family: "'JetBrains Mono', monospace", size: 13, weight: '600' },
          padding: { bottom: 20 }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) { return ctx.dataset.label + ': ' + ctx.raw + '%'; }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            backdropColor: 'transparent',
            font: { size: 10 }
          },
          pointLabels: {
            font: { size: 11 },
            color: COLORS.dim
          },
          grid: { color: COLORS.grid },
          angleLines: { color: COLORS.grid }
        }
      }
    }
  });

  // --- Chart 6: Incarceration ---
  new Chart(document.getElementById('incarcerationChart'), {
    type: 'line',
    data: {
      labels: ['Ever Arrested', 'Ever Incarcerated'],
      datasets: [
        {
          label: 'Dropout',
          data: [52, 23],
          borderColor: COLORS.dropout,
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 5,
          pointBackgroundColor: COLORS.dropout,
          tension: 0.3
        },
        {
          label: 'GED Holder',
          data: [69, 31],
          borderColor: COLORS.ged,
          backgroundColor: 'rgba(232, 115, 74, 0.15)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: COLORS.ged,
          tension: 0.3
        },
        {
          label: 'HS Diploma',
          data: [35, 8],
          borderColor: COLORS.diploma,
          backgroundColor: 'rgba(242, 193, 78, 0.15)',
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: COLORS.diploma,
          tension: 0.3
        }
      ]
    },
    options: {
      ...barOpts('Criminal Justice Contact — NLSY97 (by age 37)'),
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

  // --- Chart 7: Smoking by Education ---
  new Chart(document.getElementById('smokingChart'), {
    type: 'bar',
    data: {
      labels: ['College Degree', 'Some College', 'HS Diploma', 'HS Dropout', 'GED Holder'],
      datasets: [{
        label: 'Current Smoking Rate (%)',
        data: [8.3, 20.9, 22, 29.7, 44.1],
        backgroundColor: [
          'rgba(156, 163, 175, 0.6)',
          'rgba(156, 163, 175, 0.6)',
          COLORS.diplomaBg,
          COLORS.dropoutBg,
          COLORS.gedBg
        ],
        borderColor: [
          '#9ca3af',
          '#9ca3af',
          COLORS.diploma,
          COLORS.dropout,
          COLORS.ged
        ],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      ...barOpts('Smoking Prevalence by Education (NATS 2014 / NHIS)'),
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
})();
