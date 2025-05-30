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

namespace Volumix
{
    /// <summary>
    /// MainWindow.xaml の相互作用ロジック
    /// </summary>
    public partial class MainWindow : Window
    {
        private string videoPath;
        private double originalLoudness = 0;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void btnSelectVideo_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new OpenFileDialog { Filter = "MP4ファイル|*.mp4" };
            if (dlg.ShowDialog() == true)
            {
                videoPath = dlg.FileName;
                mediaPreview.Source = new Uri(videoPath);
                mediaPreview.Stop();
                CalculateLoudness();
            }
        }

        private void CalculateLoudness()
        {
            // ffmpegでラウドネス計算
            var ffmpegPath = "ffmpeg"; // ffmpeg.exeのパス
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
                txtTargetLoudness.Text = originalLoudness.ToString("F2");
            }
            else
            {
                txtOriginalLoudness.Text = "取得失敗";
            }
        }

        private void sliderLoudness_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            txtTargetLoudness.Text = sliderLoudness.Value.ToString("F2");
            // プレビュー音量調整（MediaElementのVolumeは0.0～1.0なので、簡易的に変換）
            double diff = sliderLoudness.Value - originalLoudness;
            mediaPreview.Volume = Math.Pow(10, diff / 20.0);
        }

        private void btnPlay_Click(object sender, RoutedEventArgs e)
        {
            mediaPreview.Play();
        }

        private void btnPause_Click(object sender, RoutedEventArgs e)
        {
            mediaPreview.Pause();
        }

        private void sliderPosition_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (mediaPreview.NaturalDuration.HasTimeSpan)
            {
                var pos = TimeSpan.FromSeconds(mediaPreview.NaturalDuration.TimeSpan.TotalSeconds * sliderPosition.Value / 100);
                mediaPreview.Position = pos;
            }
        }

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new SaveFileDialog { Filter = "MP4ファイル|*.mp4" };
            if (dlg.ShowDialog() == true)
            {
                SaveAdjustedVideo(dlg.FileName);
            }
        }

        private void SaveAdjustedVideo(string savePath)
        {
            // ffmpegで音声のみラウドネス調整して保存
            var ffmpegPath = "ffmpeg";
            double targetLoudness = sliderLoudness.Value;
            var args = $"-i \"{videoPath}\" -c:v copy -af loudnorm=I={targetLoudness}:TP=-2:LRA=11 \"{savePath}\"";
            var psi = new ProcessStartInfo(ffmpegPath, args)
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            var proc = Process.Start(psi);
            proc.WaitForExit();
            MessageBox.Show("保存が完了しました。");
        }
    }
}
