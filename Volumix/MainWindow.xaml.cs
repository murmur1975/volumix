using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Win32;
using System.Windows.Threading;
using System.Windows.Controls.Primitives;
using Path = System.IO.Path; // 明示的にSystem.IO.Pathを使用するよう指定

namespace Volumix
{
    /// <summary>
    /// MainWindow.xaml の相互作用ロジック
    /// </summary>
    public partial class MainWindow : Window
    {
        private string videoPath;
        private double originalLoudness = 0;

        // 追加: 再生位置更新用タイマーとフラグ
        private DispatcherTimer positionTimer;
        private bool isSliderDragging = false;

        // コンストラクタでイベント登録
        public MainWindow()
        {
            InitializeComponent();

            // タイマー初期化
            positionTimer = new DispatcherTimer();
            positionTimer.Interval = TimeSpan.FromMilliseconds(500);
            positionTimer.Tick += PositionTimer_Tick;

            // MediaElementのイベント登録
            mediaPreview.MediaOpened += mediaPreview_MediaOpened;
            mediaPreview.MediaFailed += mediaPreview_MediaFailed;
        }

        private void btnSelectVideo_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new OpenFileDialog { Filter = "MP4ファイル|*.mp4" };
            if (dlg.ShowDialog() == true)
            {
                videoPath = dlg.FileName;
                // 読込中メッセージ表示
                txtLoading.Visibility = Visibility.Visible;

                mediaPreview.Source = new Uri(videoPath);
                mediaPreview.Stop();
                sliderPosition.Value = 0;
                txtCurrentTime.Text = "00:00";
            }
        }

        // MediaElementのMediaOpened/MediaFailedイベントでメッセージを消す
        private void mediaPreview_MediaOpened(object sender, RoutedEventArgs e)
        {
            txtLoading.Visibility = Visibility.Collapsed;
            CalculateLoudness();
        }

        private void mediaPreview_MediaFailed(object sender, ExceptionRoutedEventArgs e)
        {
            txtLoading.Visibility = Visibility.Collapsed;
            MessageBox.Show("動画の読み込みに失敗しました。");
        }

        private void CalculateLoudness()
        {
            // ffmpeg.exeのパスをアプリと同じフォルダに配置した場合
            var ffmpegPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ffmpeg.exe");
            if (!File.Exists(ffmpegPath))
            {
                MessageBox.Show("ffmpeg.exeが見つかりません: " + ffmpegPath);
                return;
            }
            var args = $"-i \"{videoPath}\" -af loudnorm=I=-23:TP=-2:LRA=11:print_format=summary -f null -";
            var psi = new ProcessStartInfo(ffmpegPath, args)
            {
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            var proc = Process.Start(psi);
            string output = proc.StandardError.ReadToEnd();
            proc.WaitForExit();

            // ラウドネス値抽出
            var match = Regex.Match(output, @"Input Integrated:\s*(-?\d+(\.\d+)?) LUFS");
            if (match.Success)
            {
                originalLoudness = double.Parse(match.Groups[1].Value);
                txtOriginalLoudness.Text = originalLoudness.ToString("F2");
                sliderLoudness.Value = originalLoudness;
                if (txtTargetLoudness != null)
                {
                    txtTargetLoudness.Text = sliderLoudness.Value.ToString("F2");
                }
            }
            else
            {
                txtOriginalLoudness.Text = "取得失敗";
            }
        }

        private void sliderLoudness_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            UpdateMediaPreviewVolume();
            if (txtTargetLoudness != null)
            {
                txtTargetLoudness.Text = sliderLoudness.Value.ToString("F2");
            }
        }

        private void btnPlay_Click(object sender, RoutedEventArgs e)
        {
            if (mediaPreview.Source != null)
            {
                mediaPreview.Play();
                positionTimer.Start();
            }
        }

        private void btnPause_Click(object sender, RoutedEventArgs e)
        {
            mediaPreview.Pause();
            positionTimer.Stop();
        }

        // タイマーで再生位置をスライダーに反映
        private void PositionTimer_Tick(object sender, EventArgs e)
        {
            if (mediaPreview.NaturalDuration.HasTimeSpan && !isSliderDragging)
            {
                double total = mediaPreview.NaturalDuration.TimeSpan.TotalSeconds;
                double current = mediaPreview.Position.TotalSeconds;
                sliderPosition.Value = (current / total) * 100;
                txtCurrentTime.Text = TimeSpan.FromSeconds(current).ToString(@"mm\:ss");
            }
        }

        // スライダー操作開始
        private void sliderPosition_DragStarted(object sender, DragStartedEventArgs e)
        {
            isSliderDragging = true;
        }

        // スライダー操作終了
        private void sliderPosition_DragCompleted(object sender, DragCompletedEventArgs e)
        {
            isSliderDragging = false;
            SetMediaPositionFromSlider();
        }

        // スライダー値変更時
        private void sliderPosition_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (isSliderDragging) return;
            SetMediaPositionFromSlider();
        }

        // スライダー値からMediaElementの再生位置を設定
        private void SetMediaPositionFromSlider()
        {
            if (mediaPreview.NaturalDuration.HasTimeSpan)
            {
                double total = mediaPreview.NaturalDuration.TimeSpan.TotalSeconds;
                double pos = total * sliderPosition.Value / 100;
                mediaPreview.Position = TimeSpan.FromSeconds(pos);
                txtCurrentTime.Text = TimeSpan.FromSeconds(pos).ToString(@"mm\:ss");
            }
        }

        private void sliderPosition_Loaded(object sender, RoutedEventArgs e)
        {
            var slider = sender as Slider;
            if (slider != null)
            {
                var thumb = GetThumbFromSlider(slider);
                if (thumb != null)
                {
                    thumb.DragStarted += sliderPosition_DragStarted;
                    thumb.DragCompleted += sliderPosition_DragCompleted;
                }
            }
        }

        private Thumb GetThumbFromSlider(Slider slider)
        {
            if (slider.Template != null)
            {
                return slider.Template.FindName("PART_Track", slider) as Thumb;
            }
            return null;
        }

        private void sliderPosition_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            // スライダー操作中の処理を記述
            mediaPreview.Pause();
        }

        private void sliderPosition_PreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            // スライダー操作終了後の処理を記述
            mediaPreview.Play();
        }

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            // 元ファイル名と拡張子取得
            var baseName = Path.GetFileNameWithoutExtension(videoPath);
            var ext = Path.GetExtension(videoPath);

            // 既存の _LKFS-24_26 のような部分を除去
            baseName = Regex.Replace(baseName, @"_LKFS-?\d+_\d{2}$", "");

            // 調整後LKFS値をファイル名に追加
            var targetLoudness = sliderLoudness.Value.ToString("F2").Replace('.', '_');
            var defaultFileName = $"{baseName}_LKFS{(sliderLoudness.Value < 0 ? "" : "-")}{targetLoudness}{ext}";

            var dlg = new SaveFileDialog
            {
                Filter = "MP4ファイル|*.mp4",
                FileName = defaultFileName
            };
            if (dlg.ShowDialog() == true)
            {
                SaveAdjustedVideo(dlg.FileName);
            }
        }

        private async void SaveAdjustedVideo(string savePath)
        {
            var ffmpegPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ffmpeg.exe");
            if (!File.Exists(ffmpegPath))
            {
                MessageBox.Show("ffmpeg.exeが見つかりません: " + ffmpegPath);
                return;
            }
            double targetLoudness = sliderLoudness.Value;
            var args = $"-y -i \"{videoPath}\" -c:v copy -af loudnorm=I={targetLoudness}:TP=-2:LRA=11 \"{savePath}\"";
            var psi = new ProcessStartInfo(ffmpegPath, args)
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            try
            {
                string error = "";
                await Task.Run(() =>
                {
                    using (var proc = Process.Start(psi))
                    {
                        error = proc.StandardError.ReadToEnd();
                        proc.WaitForExit();
                    }
                });
                if (!File.Exists(savePath))
                {
                    MessageBox.Show("保存に失敗しました。\n\nffmpeg出力:\n" + error);
                }
                else
                {
                    MessageBox.Show("保存が完了しました。");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("保存中にエラーが発生しました: " + ex.Message);
            }
        }

        private void btnSetMinus24_Click(object sender, RoutedEventArgs e)
        {
            sliderLoudness.Value = -24.0;
            if (txtTargetLoudness != null)
            {
                txtTargetLoudness.Text = "-24.00";
            }
        }

        private void txtTargetLoudness_LostFocus(object sender, RoutedEventArgs e)
        {
            UpdateLoudnessFromTargetBox();
        }

        private void txtTargetLoudness_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                UpdateLoudnessFromTargetBox();
            }
        }

        private void UpdateLoudnessFromTargetBox()
        {
            if (double.TryParse(txtTargetLoudness.Text, out double value))
            {
                if (value < sliderLoudness.Minimum) value = sliderLoudness.Minimum;
                if (value > sliderLoudness.Maximum) value = sliderLoudness.Maximum;
                value = Math.Round(value, 2, MidpointRounding.AwayFromZero);
                sliderLoudness.Value = value;
                if (txtTargetLoudness != null)
                {
                    txtTargetLoudness.Text = value.ToString("F2");
                }
            }
            else
            {
                if (txtTargetLoudness != null)
                {
                    txtTargetLoudness.Text = sliderLoudness.Value.ToString("F2");
                }
            }
        }

        // プレビュー音量を即時反映する共通メソッドを追加
        private void UpdateMediaPreviewVolume()
        {
            double diff = sliderLoudness.Value - originalLoudness;
            mediaPreview.Volume = Math.Pow(10, diff / 20.0);
        }
    }
}
